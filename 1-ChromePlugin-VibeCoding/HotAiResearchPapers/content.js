// Content script for AI Research Papers extension

// Listen for messages from the popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getPageInfo':
            sendResponse(getPageInfo());
            break;
        case 'highlightPapers':
            highlightPapersOnPage(request.papers);
            break;
        case 'searchPageForPapers':
            searchPageForPapers(request.query);
            break;
    }
});

// Get information about the current page
function getPageInfo() {
    const pageInfo = {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        isArxiv: window.location.hostname.includes('arxiv.org'),
        isResearchPage: isResearchPage(),
        hasPapers: findPapersOnPage().length > 0
    };
    
    return pageInfo;
}

// Check if current page is a research-related page
function isResearchPage() {
    const researchKeywords = [
        'research', 'paper', 'publication', 'academic', 'scholar',
        'conference', 'journal', 'arxiv', 'doi', 'citation'
    ];
    
    const pageText = document.body.innerText.toLowerCase();
    const title = document.title.toLowerCase();
    
    return researchKeywords.some(keyword => 
        pageText.includes(keyword) || title.includes(keyword)
    );
}

// Find papers mentioned on the current page
function findPapersOnPage() {
    const papers = [];
    
    // Look for arXiv IDs
    const arxivPattern = /arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+)/gi;
    let match;
    while ((match = arxivPattern.exec(document.body.innerHTML)) !== null) {
        papers.push({
            type: 'arxiv',
            id: match[1],
            url: `https://arxiv.org/abs/${match[1]}`,
            context: getContextAround(match.index, 100)
        });
    }
    
    // Look for DOIs
    const doiPattern = /doi\.org\/([^\s<>\"']+)/gi;
    while ((match = doiPattern.exec(document.body.innerHTML)) !== null) {
        papers.push({
            type: 'doi',
            id: match[1],
            url: `https://doi.org/${match[1]}`,
            context: getContextAround(match.index, 100)
        });
    }
    
    // Look for paper titles in quotes or headings
    const titlePatterns = [
        /[\"\"]([^\"\"]{10,100})[\"\"]/g,  // Quoted titles
        /<h[1-6][^>]*>([^<]{10,100})<\/h[1-6]>/gi  // Headings
    ];
    
    titlePatterns.forEach(pattern => {
        while ((match = pattern.exec(document.body.innerHTML)) !== null) {
            if (isLikelyPaperTitle(match[1])) {
                papers.push({
                    type: 'title',
                    title: match[1],
                    context: getContextAround(match.index, 100)
                });
            }
        }
    });
    
    return papers;
}

// Get context around a specific position in the text
function getContextAround(position, length) {
    const text = document.body.innerText;
    const start = Math.max(0, position - length);
    const end = Math.min(text.length, position + length);
    return text.substring(start, end).trim();
}

// Check if text looks like a paper title
function isLikelyPaperTitle(text) {
    const titleIndicators = [
        /^[A-Z][^.!?]*[.!?]?$/,  // Starts with capital, no sentence ending
        /[A-Z][a-z]+ [A-Z][a-z]+/,  // Multiple capitalized words
        /(?:Towards|Towards|Introduction|Abstract|Conclusion)/i,  // Common paper words
        /[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+/  // At least 3 capitalized words
    ];
    
    return titleIndicators.some(pattern => pattern.test(text)) && 
           text.length > 10 && text.length < 200;
}

// Highlight papers mentioned on the page
function highlightPapersOnPage(papers) {
    // Remove existing highlights
    removeExistingHighlights();
    
    papers.forEach(paper => {
        if (paper.type === 'arxiv' && paper.id) {
            highlightArxivPaper(paper.id);
        } else if (paper.type === 'doi' && paper.id) {
            highlightDoiPaper(paper.id);
        }
    });
}

// Highlight arXiv papers on the page
function highlightArxivPaper(arxivId) {
    const patterns = [
        new RegExp(`arxiv\\.org/(?:abs|pdf)/${arxivId.replace(/\./g, '\\.')}`, 'gi'),
        new RegExp(arxivId.replace(/\./g, '\\.'), 'g')
    ];
    
    patterns.forEach(pattern => {
        highlightTextMatches(pattern, 'arxiv-paper-highlight');
    });
}

// Highlight DOI papers on the page
function highlightDoiPaper(doiId) {
    const patterns = [
        new RegExp(`doi\\.org/${doiId.replace(/\./g, '\\.')}`, 'gi'),
        new RegExp(doiId.replace(/\./g, '\\.'), 'g')
    ];
    
    patterns.forEach(pattern => {
        highlightTextMatches(pattern, 'doi-paper-highlight');
    });
}

// Highlight text matches with a specific class
function highlightTextMatches(pattern, className) {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const matches = text.match(pattern);
        
        if (matches) {
            const parent = textNode.parentNode;
            if (parent.nodeName !== 'SCRIPT' && parent.nodeName !== 'STYLE') {
                const highlightedText = text.replace(pattern, (match) => {
                    return `<span class="${className}" style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 3px; cursor: pointer;" title="Click to open paper">${match}</span>`;
                });
                
                const span = document.createElement('span');
                span.innerHTML = highlightedText;
                parent.replaceChild(span, textNode);
                
                // Add click handlers to highlighted elements
                span.querySelectorAll(`.${className}`).forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        const text = el.textContent;
                        if (text.includes('arxiv.org')) {
                            window.open(text, '_blank');
                        } else if (text.includes('doi.org')) {
                            window.open(text, '_blank');
                        }
                    });
                });
            }
        }
    });
}

// Remove existing highlights
function removeExistingHighlights() {
    const highlights = document.querySelectorAll('.arxiv-paper-highlight, .doi-paper-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        if (parent.nodeType === Node.TEXT_NODE) {
            parent.parentNode.replaceChild(document.createTextNode(highlight.textContent), parent);
        } else {
            parent.parentNode.replaceChild(document.createTextNode(highlight.textContent), highlight);
        }
    });
}

// Add floating action button for quick access
function addFloatingButton() {
    // Functionality removed as per user request.
    // The floating fire logo button is no longer added to pages.
}

// Initialize content script
function init() {
    // The addFloatingButton function is now empty, so no button will be added.
    // if (isResearchPage()) {
    //     addFloatingButton();
    // }
    
    // Listen for page changes (for SPA support)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(() => {
                // The addFloatingButton function is now empty, so no button will be added.
                // if (isResearchPage()) {
                //     addFloatingButton();
                // }
            }, 1000);
        }
    }).observe(document, { subtree: true, childList: true });
}

// Start the content script
init();

// Export functions for potential use
window.AIPapersContentScript = {
    findPapersOnPage,
    highlightPapersOnPage,
    searchPageForPapers,
    getPageInfo
};