// Search functionality for The Awakened Youth website
class SearchEngine {
    constructor() {
        this.searchData = [];
        this.initializeSearch();
        this.setupEventListeners();
    }

    initializeSearch() {
        // Initialize search data with static pages and dynamic columns
        this.searchData = [
            {
                id: 'home',
                title: 'The Awakened Youth - Home',
                content: 'Awakening hearts, guiding youth, and finding purpose through Islam. As a new Islamic writer, I aim to gently remind hearts especially the youth of the beauty and guidance found in Islam.',
                url: 'index.html',
                type: 'page'
            },
            {
                id: 'about',
                title: 'About the Writer',
                content: 'I am a beginner Islamic writer who hopes to remind people especially the youth of the beautiful teachings and guidance that Islam offers us in every aspect of life. My journey as a writer began with a simple desire to share the peace, purpose, and clarity that I have found through Islam.',
                url: 'about.html',
                type: 'page'
            },
            {
                id: 'contact',
                title: 'Contact Me',
                content: 'I would love to hear from you! Whether you have feedback, questions, suggestions for future columns, or simply want to share your thoughts, please don\'t hesitate to reach out.',
                url: 'contact.html',
                type: 'page'
            },
            {
                id: 'feedback',
                title: 'Feedback & Questions',
                content: 'Welcome to the Feedback & Questions page! Here you can ask questions, share your thoughts, or provide feedback about the content. Your approved questions and my responses will be displayed for the benefit of all visitors.',
                url: 'feedback.html',
                type: 'page'
            }
        ];

        // Add published columns to search data
        this.loadColumnsData();
    }

    loadColumnsData() {
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        const publishedColumns = columns.filter(col => col.status === 'published');
        
        publishedColumns.forEach(column => {
            this.searchData.push({
                id: column.id,
                title: column.title,
                content: this.stripMarkdown(column.content),
                url: `column.html?id=${column.id}`,
                type: 'column',
                date: column.createdAt
            });
        });
    }

    stripMarkdown(text) {
        // Remove markdown formatting for search
        return text
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/>\s/g, '') // Remove quotes
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .trim();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        const heroSearchInput = document.getElementById('heroSearchInput');
        const heroSearchResults = document.getElementById('heroSearchResults');
        
        // Header search functionality
        if (searchInput) {
            // Search on input
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.showResults(this.search(query));
                } else {
                    this.hideResults();
                }
            });

            // Search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });
        }

        // Hero search functionality
        if (heroSearchInput) {
            // Search on input
            heroSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.showHeroResults(this.search(query));
                } else {
                    this.hideHeroResults();
                }
            });

            // Search on Enter key
            heroSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performHeroSearch();
                }
            });
        }

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar') && !e.target.closest('.hero-search-bar')) {
                this.hideResults();
                this.hideHeroResults();
            }
        });

        // Prevent hiding when clicking inside search results
        if (searchResults) {
            searchResults.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        if (heroSearchResults) {
            heroSearchResults.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    search(query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        const results = [];

        this.searchData.forEach(item => {
            let score = 0;
            const titleLower = item.title.toLowerCase();
            const contentLower = item.content.toLowerCase();

            // Calculate relevance score
            searchTerms.forEach(term => {
                // Title matches get higher score
                if (titleLower.includes(term)) {
                    score += titleLower === term ? 10 : 5; // Exact match vs partial
                }
                
                // Content matches
                if (contentLower.includes(term)) {
                    score += 2;
                }
            });

            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    snippet: this.generateSnippet(item.content, searchTerms)
                });
            }
        });

        // Sort by score (highest first), then by type (columns first)
        return results.sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            if (a.type === 'column' && b.type !== 'column') return -1;
            if (a.type !== 'column' && b.type === 'column') return 1;
            return 0;
        }).slice(0, 8); // Limit to 8 results
    }

    generateSnippet(content, searchTerms) {
        const maxLength = 120;
        let snippet = content;

        // Try to find a snippet containing search terms
        for (const term of searchTerms) {
            const index = content.toLowerCase().indexOf(term.toLowerCase());
            if (index !== -1) {
                const start = Math.max(0, index - 50);
                const end = Math.min(content.length, index + 70);
                snippet = content.substring(start, end);
                if (start > 0) snippet = '...' + snippet;
                if (end < content.length) snippet = snippet + '...';
                break;
            }
        }

        // Truncate if still too long
        if (snippet.length > maxLength) {
            snippet = snippet.substring(0, maxLength) + '...';
        }

        return snippet;
    }

    showResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found. Try different keywords.</div>';
        } else {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="window.location.href='${result.url}'">
                    <div class="search-result-type">${result.type === 'column' ? 'Column' : 'Page'}</div>
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-snippet">${result.snippet}</div>
                </div>
            `).join('');
        }

        searchResults.style.display = 'block';
    }

    hideResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    showHeroResults(results) {
        const heroSearchResults = document.getElementById('heroSearchResults');
        if (!heroSearchResults) return;

        if (results.length === 0) {
            heroSearchResults.innerHTML = '<div class="no-results">No results found. Try different keywords.</div>';
        } else {
            heroSearchResults.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="window.location.href='${result.url}'">
                    <div class="search-result-type">${result.type === 'column' ? 'Column' : 'Page'}</div>
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-snippet">${result.snippet}</div>
                </div>
            `).join('');
        }

        heroSearchResults.style.display = 'block';
    }

    hideHeroResults() {
        const heroSearchResults = document.getElementById('heroSearchResults');
        if (heroSearchResults) {
            heroSearchResults.style.display = 'none';
        }
    }

    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput ? searchInput.value.trim() : '';
        
        if (query.length >= 2) {
            // Redirect to search results page
            window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        }
    }

    // Method to refresh search data (call when new columns are added)
    refreshSearchData() {
        this.searchData = this.searchData.filter(item => item.type !== 'column');
        this.loadColumnsData();
    }
}

// Global search function for button click
function performSearch() {
    if (window.searchEngine) {
        window.searchEngine.performSearch();
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.searchEngine = new SearchEngine();
});

// Additional functionality for columns page search
document.addEventListener('DOMContentLoaded', function() {
    const columnsSearchInput = document.getElementById('columnsSearchInput');
    const columnsSearchResults = document.getElementById('columnsSearchResults');
    
    if (columnsSearchInput && columnsSearchResults) {
        columnsSearchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                const results = window.searchEngine.search(query);
                const columnResults = results.filter(result => result.type === 'column');
                
                if (columnResults.length > 0) {
                    columnsSearchResults.innerHTML = `
                        <div style="background: white; border-radius: 8px; padding: 15px; border: 1px solid #E6E6FF;">
                            <h4 style="color: #330066; margin-bottom: 10px;">Found ${columnResults.length} column${columnResults.length !== 1 ? 's' : ''}:</h4>
                            ${columnResults.map(result => `
                                <div style="padding: 10px; border-bottom: 1px solid #F5F0FF; cursor: pointer;" onclick="window.location.href='${result.url}'">
                                    <div style="color: #330066; font-weight: 600; margin-bottom: 5px;">${result.title}</div>
                                    <div style="color: #666; font-size: 0.9rem;">${result.snippet}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    columnsSearchResults.style.display = 'block';
                } else {
                    columnsSearchResults.innerHTML = `
                        <div style="background: white; border-radius: 8px; padding: 15px; border: 1px solid #E6E6FF; text-align: center; color: #666;">
                            No columns found matching "${query}". Try different keywords.
                        </div>
                    `;
                    columnsSearchResults.style.display = 'block';
                }
            } else {
                columnsSearchResults.style.display = 'none';
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#columnsSearchInput') && !e.target.closest('#columnsSearchResults')) {
                columnsSearchResults.style.display = 'none';
            }
        });
    }
});