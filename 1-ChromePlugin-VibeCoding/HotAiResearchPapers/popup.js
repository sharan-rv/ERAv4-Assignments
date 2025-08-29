class AIPapersPlugin {
    constructor() {
        this.currentPeriod = 'today';
        this.currentCategory = '';
        this.currentSortBy = 'hotness'; // 'hotness' will now refer to recency
        this.papers = [];
        this.filteredPapers = [];
        this.init();
    }

    init() {
        this.bindEvents();
        // Start loading papers immediately
        this.loadPapers();
        this.updateLastUpdated();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.period);
            });
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', () => { // Changed to 'input' for live search
            this.performSearch();
        });

        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSortBy = e.target.value;
            this.applyFilters();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadPapers();
        });
    }

    switchTab(period) {
        this.currentPeriod = period;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });

        this.loadPapers();
    }

    async loadPapers() {
        this.showLoading(); // Show loading spinner
        
        try {
            // Set a strict 60-second overall timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Overall 60-second timeout reached')), 60000);
            });
            
            // Attempt to fetch papers within the timeout
            const fetchPromise = this.fetchPapers();
            const fetchedPapers = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (fetchedPapers && fetchedPapers.length > 0) {
                this.papers = fetchedPapers;
                this.applyFilters();
                this.updateLastUpdated();
                // FIXED: Removed showMessage call that was hiding the papers
                console.log('Successfully loaded and processing papers:', this.papers);
            } else {
                throw new Error('No papers returned from arXiv API.');
            }
        } catch (error) {
            console.error('Error in loadPapers:', error);
            
            if (error.message.includes('timeout')) {
                // If timeout, display any papers that might have been partially loaded
                if (this.papers && this.papers.length > 0) {
                    this.applyFilters();
                    this.updateLastUpdated();
                    this.showMessage(`⏱️ 60-second timeout. Showing ${this.papers.length} available papers from arXiv.`, 'info'); 
                    console.log('Timeout hit, showing partially loaded papers:', this.papers);
                } else {
                    this.showError('⏱️ 60-second timeout reached. No papers loaded. Please check your connection and try refreshing.');
                }
            } else {
                this.showError(`❌ Failed to load papers: ${error.message}. Please check your internet connection and try refreshing.`);
            }
        } finally {
            // Ensure loading spinner is hidden even if there's an error
            document.getElementById('loading').style.display = 'none';
        }
    }

    async fetchPapers() {
        const period = this.currentPeriod;
        // For simplicity and faster loading, initially fetch only from cs.AI
        const categories = ['cs.AI']; // You can expand this if needed later
        
        let papers = [];
        
        // Fetch papers from arXiv API in parallel. No individual timeouts for simplicity.
        const fetchPromises = categories.map(category => 
            this.fetchArxivPapers(category, period).catch(error => {
                console.warn(`Failed to fetch papers for ${category}:`, error);
                return []; // Return empty array on error to keep the Promise.all working
            })
        );
        
        const results = await Promise.all(fetchPromises); // Use Promise.all
        results.forEach(categoryPapers => {
            papers = papers.concat(categoryPapers);
        });

        // Limit to a reasonable number of papers for display
        papers = papers.slice(0, 30); 
        
        // Calculate hotness score (now based on recency only)
        papers = this.calculateHotnessScore(papers);
        
        return papers;
    }

    async fetchArxivPapers(category, period) {
        const baseUrl = 'http://export.arxiv.org/api/query';
        // Max results 20 for each category
        const query = `search_query=cat:${category}&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending`;
        
        try {
            const response = await fetch(`${baseUrl}?${query}`);
            if (!response.ok) {
                console.error(`arXiv API returned status: ${response.status} for category: ${category}`);
                return [];
            }
            const xmlText = await response.text();
            
            return this.parseArxivXML(xmlText);
        } catch (error) {
            console.error(`Error fetching from arXiv for category ${category}:`, error);
            return [];
        }
    }

    parseArxivXML(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const entries = xmlDoc.querySelectorAll('entry');
        
        const papers = [];
        entries.forEach(entry => {
            const title = entry.querySelector('title')?.textContent?.trim() || 'No Title Available';
            const summary = entry.querySelector('summary')?.textContent?.trim() || 'No abstract available.';
            const authors = Array.from(entry.querySelectorAll('author name')).map(name => name.textContent.trim());
            const category = entry.querySelector('category')?.getAttribute('term') || 'Unknown Category';
            const published = entry.querySelector('published')?.textContent || new Date().toISOString();
            const id = entry.querySelector('id')?.textContent || '';
            
            papers.push({
                id: id.split('/').pop() || `arxiv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Robust ID
                title,
                summary,
                authors,
                category,
                published: new Date(published),
                arxivUrl: id || '#',
                pdfUrl: id ? id.replace('abs', 'pdf') : '#',
                citations: Math.floor(Math.random() * 100) + 10, // Placeholder citations
                downloads: Math.floor(Math.random() * 1000) + 100, // Placeholder downloads
                socialShares: Math.floor(Math.random() * 50) + 5, // Placeholder social shares
                hotnessScore: 0 // Will be calculated below
            });
        });
        
        return papers;
    }

    calculateHotnessScore(papers) {
        papers.forEach(paper => {
            // Simplified hotness score based primarily on recency
            paper.hotnessScore = this.calculateRecencyScore(paper.published);
        });
        
        return papers;
    }

    calculateRecencyScore(publishedDate) {
        if (!(publishedDate instanceof Date) || isNaN(publishedDate)) return 0.1; // Fallback for invalid date

        const now = new Date();
        const daysDiff = (now - publishedDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 1) return 1.0;
        if (daysDiff <= 7) return 0.8;
        if (daysDiff <= 30) return 0.6;
        if (daysDiff <= 90) return 0.4;
        return 0.2;
    }

    applyFilters() {
        this.filteredPapers = [...this.papers];
        
        // Apply category filter
        if (this.currentCategory) {
            this.filteredPapers = this.filteredPapers.filter(paper => 
                paper.category === this.currentCategory
            );
        }
        
        // Apply search filter
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            this.filteredPapers = this.filteredPapers.filter(paper =>
                paper.title.toLowerCase().includes(searchTerm) ||
                paper.summary.toLowerCase().includes(searchTerm) ||
                paper.authors.some(author => author.toLowerCase().includes(searchTerm))
            );
        }
        
        // Sort papers
        this.sortPapers();
        
        // Display papers
        this.displayPapers();
    }

    sortPapers() {
        switch (this.currentSortBy) {
            case 'hotness': // Now sorts by recency-based hotness
                this.filteredPapers.sort((a, b) => b.hotnessScore - a.hotnessScore);
                break;
            case 'citations': // Will sort by random placeholder citations
                this.filteredPapers.sort((a, b) => b.citations - a.citations);
                break;
            case 'downloads': // Will sort by random placeholder downloads
                this.filteredPapers.sort((a, b) => b.downloads - a.downloads);
                break;
            case 'date':
                this.filteredPapers.sort((a, b) => b.published - a.published);
                break;
        }
    }

    performSearch() {
        this.applyFilters();
    }

    displayPapers() {
        const papersList = document.getElementById('papersList');
        const noResults = document.getElementById('noResults');
        
        if (this.filteredPapers.length === 0) {
            papersList.style.display = 'none';
            noResults.style.display = 'block';
            console.log('No filtered papers to display.');
            return;
        }
        
        papersList.style.display = 'block'; // Ensure papersList is visible
        noResults.style.display = 'none';
        
        try {
            const paperCardsHtml = this.filteredPapers
                .slice(0, 20) // Limit to top 20 papers
                .map(paper => this.createPaperCard(paper))
                .join('');
            
            if (paperCardsHtml) {
                papersList.innerHTML = paperCardsHtml;
                console.log(`Successfully rendered ${this.filteredPapers.length} papers to the DOM.`);
                
                // Add click event listeners to paper cards
                this.addPaperCardClickListeners();
            } else {
                papersList.innerHTML = '<p style="color: gray;">No displayable papers after rendering attempt.</p>';
                console.warn('No HTML generated for paper cards, even though filteredPapers has items.');
            }
        } catch (renderError) {
            console.error('Critical Error rendering paper cards:', renderError);
            papersList.innerHTML = '<p style="color: red;">Error displaying papers. See console for details.</p>';
        }
    }

    createPaperCard(paper) {
        // console.log('Attempting to render paper:', paper); // Keep this for debugging if issues persist

        // Ensure all displayed data is safe and has fallbacks
        const title = this.escapeHtml(paper.title || 'Untitled Paper');
        const summary = this.escapeHtml(paper.summary || 'No abstract available.');
        const authors = this.escapeHtml(paper.authors && paper.authors.length > 0 ? paper.authors.slice(0, 3).join(', ') : 'Unknown Authors');
        const moreAuthors = paper.authors && paper.authors.length > 3 ? ` +${paper.authors.length - 3} more` : '';
        const category = paper.category || 'N/A';
        const arxivUrl = paper.arxivUrl || '#';
        const citations = paper.citations !== undefined ? paper.citations : 0;
        const downloads = paper.downloads !== undefined ? paper.downloads : 0;

        const hotnessBadge = paper.hotnessScore > 0.7 ? 
            `<div class="hotness-badge">🔥 Hot</div>` : '';
        
        return `
            <div class="paper-card" data-paper-id="${paper.id}" data-arxiv-url="${arxivUrl}">
                ${hotnessBadge}
                <h3 class="paper-title">${title}</h3>
                <p class="paper-authors">${authors}${moreAuthors}</p>
                <p class="paper-abstract">${summary}</p>
                <div class="paper-meta">
                    <span class="paper-category">${category}</span>
                    <div class="paper-stats">
                        <span class="stat">📊 ${citations}</span>
                        <span class="stat">⬇️ ${downloads}</span>
                        <span class="stat">📅 ${this.formatDate(paper.published)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(date) {
        if (!(date instanceof Date) || isNaN(date)) return 'N/A';

        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('papersList').style.display = 'none';
        document.getElementById('noResults').style.display = 'none';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('papersList').style.display = 'none';
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('noResults').innerHTML = `<p style="color: red;">${message}</p>`;
    }

    showMessage(message, type = 'info') {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('papersList').style.display = 'none';
        document.getElementById('noResults').style.display = 'block';
        
        const color = type === 'info' ? '#17a2b8' : (type === 'success' ? '#28a745' : 'black');
        const icon = type === 'info' ? 'ℹ️' : (type === 'success' ? '✅' : ' ');
        
        document.getElementById('noResults').innerHTML = `<p style="color: ${color};">${icon} ${message}</p>`;
    }

    addPaperCardClickListeners() {
        const paperCards = document.querySelectorAll('.paper-card');
        paperCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const arxivUrl = card.getAttribute('data-arxiv-url');
                if (arxivUrl && arxivUrl !== '#') {
                    // Use chrome.tabs.create to open in new tab
                    chrome.tabs.create({ url: arxivUrl });
                }
            });
        });
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
    }
}

// Initialize the plugin when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new AIPapersPlugin();
});