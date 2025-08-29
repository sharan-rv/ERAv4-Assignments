// Background service worker for AI Research Papers extension

// Cache for storing papers data
let papersCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Install event - set up initial cache
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Research Papers extension installed');
    
    // Set up alarm for periodic updates
    chrome.alarms.create('updatePapers', { periodInMinutes: 30 });
    
    // Initialize storage
    chrome.storage.local.set({
        lastUpdate: Date.now(),
        papersCache: {},
        settings: {
            autoRefresh: true,
            notificationEnabled: true,
            categories: ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.NE', 'stat.ML']
        }
    });
});

// Handle alarm events for periodic updates
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updatePapers') {
        updatePapersInBackground();
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getPapers':
            handleGetPapers(request, sendResponse);
            return true; // Keep message channel open for async response
            
        case 'updatePapers':
            handleUpdatePapers(request, sendResponse);
            return true;
            
        case 'getSettings':
            handleGetSettings(sendResponse);
            return true;
            
        case 'updateSettings':
            handleUpdateSettings(request, sendResponse);
            return true;
            
        case 'openPaper':
            handleOpenPaper(request);
            return false;
    }
});

// Handle getting papers from cache or fetch new ones
async function handleGetPapers(request, sendResponse) {
    try {
        const { period, category } = request;
        const cacheKey = `${period}_${category || 'all'}`;
        
        // Check if we have valid cached data
        const cachedData = papersCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            sendResponse({ success: true, papers: cachedData.papers, fromCache: true });
            return;
        }
        
        // Fetch new data
        const papers = await fetchPapersFromArxiv(period, category);
        const enhancedPapers = await enhancePapersWithMetrics(papers);
        const scoredPapers = calculateHotnessScore(enhancedPapers);
        
        // Cache the results
        papersCache.set(cacheKey, {
            papers: scoredPapers,
            timestamp: Date.now()
        });
        
        sendResponse({ success: true, papers: scoredPapers, fromCache: false });
        
    } catch (error) {
        console.error('Error in handleGetPapers:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle manual paper updates
async function handleUpdatePapers(request, sendResponse) {
    try {
        const { period, category } = request;
        const papers = await fetchPapersFromArxiv(period, category);
        const enhancedPapers = await enhancePapersWithMetrics(papers);
        const scoredPapers = calculateHotnessScore(enhancedPapers);
        
        // Update cache
        const cacheKey = `${period}_${category || 'all'}`;
        papersCache.set(cacheKey, {
            papers: scoredPapers,
            timestamp: Date.now()
        });
        
        // Update storage
        chrome.storage.local.set({
            lastUpdate: Date.now(),
            papersCache: Object.fromEntries(papersCache)
        });
        
        sendResponse({ success: true, papers: scoredPapers });
        
    } catch (error) {
        console.error('Error in handleUpdatePapers:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle getting settings
function handleGetSettings(sendResponse) {
    chrome.storage.local.get(['settings'], (result) => {
        sendResponse({ success: true, settings: result.settings || {} });
    });
}

// Handle updating settings
function handleUpdateSettings(request, sendResponse) {
    chrome.storage.local.get(['settings'], (result) => {
        const newSettings = { ...result.settings, ...request.settings };
        chrome.storage.local.set({ settings: newSettings }, () => {
            sendResponse({ success: true, settings: newSettings });
        });
    });
}

// Handle opening paper in new tab
function handleOpenPaper(request) {
    if (request.paperId) {
        chrome.tabs.create({ url: `https://arxiv.org/abs/${request.paperId}` });
    }
}

// Fetch papers from arXiv API
async function fetchPapersFromArxiv(period, category) {
    const categories = category ? [category] : ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.NE', 'stat.ML'];
    let allPapers = [];
    
    for (const cat of categories) {
        try {
            const response = await fetch(`http://export.arxiv.org/api/query?search_query=cat:${cat}&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending`);
            const xmlText = await response.text();
            const papers = parseArxivXML(xmlText);
            allPapers = allPapers.concat(papers);
        } catch (error) {
            console.warn(`Failed to fetch papers for ${cat}:`, error);
        }
    }
    
    return allPapers;
}

// Parse arXiv XML response
function parseArxivXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const entries = xmlDoc.querySelectorAll('entry');
    
    const papers = [];
    entries.forEach(entry => {
        const title = entry.querySelector('title')?.textContent?.trim() || '';
        const summary = entry.querySelector('summary')?.textContent?.trim() || '';
        const authors = Array.from(entry.querySelectorAll('author name')).map(name => name.textContent.trim());
        const category = entry.querySelector('category')?.getAttribute('term') || '';
        const published = entry.querySelector('published')?.textContent || '';
        const id = entry.querySelector('id')?.textContent || '';
        
        papers.push({
            id: id.split('/').pop(),
            title,
            summary,
            authors,
            category,
            published: new Date(published),
            arxivUrl: id,
            pdfUrl: id.replace('abs', 'pdf'),
            citations: 0,
            downloads: 0,
            socialShares: 0,
            hotnessScore: 0
        });
    });
    
    return papers;
}

// Enhance papers with metrics from Semantic Scholar
async function enhancePapersWithMetrics(papers) {
    const enhancedPapers = [];
    
    for (const paper of papers) {
        try {
            const metrics = await getSemanticScholarMetrics(paper.title);
            paper.citations = metrics.citations || 0;
            paper.downloads = metrics.downloads || 0;
            paper.socialShares = metrics.socialShares || 0;
            enhancedPapers.push(paper);
        } catch (error) {
            console.warn(`Failed to enhance paper ${paper.title}:`, error);
            enhancedPapers.push(paper);
        }
    }
    
    return enhancedPapers;
}

// Get metrics from Semantic Scholar API
async function getSemanticScholarMetrics(title) {
    try {
        const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(title)}&limit=1`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const paper = data.data[0];
            return {
                citations: paper.citationCount || 0,
                downloads: paper.downloadCount || 0,
                socialShares: paper.socialMediaCount || 0
            };
        }
    } catch (error) {
        console.warn('Failed to fetch Semantic Scholar metrics:', error);
    }
    
    return { citations: 0, downloads: 0, socialShares: 0 };
}

// Calculate hotness score for papers
function calculateHotnessScore(papers) {
    papers.forEach(paper => {
        const recencyScore = calculateRecencyScore(paper.published);
        const citationScore = Math.min(paper.citations / 100, 1);
        const downloadScore = Math.min(paper.downloads / 1000, 1);
        const socialScore = Math.min(paper.socialShares / 50, 1);
        
        paper.hotnessScore = (
            recencyScore * 0.4 +
            citationScore * 0.3 +
            downloadScore * 0.2 +
            socialScore * 0.1
        );
    });
    
    return papers;
}

// Calculate recency score
function calculateRecencyScore(publishedDate) {
    const now = new Date();
    const daysDiff = (now - publishedDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 1) return 1.0;
    if (daysDiff <= 7) return 0.8;
    if (daysDiff <= 30) return 0.6;
    if (daysDiff <= 90) return 0.4;
    return 0.2;
}

// Background update function
async function updatePapersInBackground() {
    try {
        console.log('Updating papers in background...');
        
        // Update for different periods
        const periods = ['today', 'week', 'month'];
        for (const period of periods) {
            const papers = await fetchPapersFromArxiv(period);
            const enhancedPapers = await enhancePapersWithMetrics(papers);
            const scoredPapers = calculateHotnessScore(enhancedPapers);
            
            const cacheKey = `${period}_all`;
            papersCache.set(cacheKey, {
                papers: scoredPapers,
                timestamp: Date.now()
            });
        }
        
        // Update storage
        chrome.storage.local.set({
            lastUpdate: Date.now(),
            papersCache: Object.fromEntries(papersCache)
        });
        
        console.log('Background update completed');
        
    } catch (error) {
        console.error('Background update failed:', error);
    }
}

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('AI Research Papers extension started');
    
    // Load cached data from storage
    chrome.storage.local.get(['papersCache'], (result) => {
        if (result.papersCache) {
            papersCache = new Map(Object.entries(result.papersCache));
        }
    });
    
    // Set up alarm for periodic updates
    chrome.alarms.create('updatePapers', { periodInMinutes: 30 });
});
