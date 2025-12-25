// Enhanced Features for The Awakened Youth Website
class WebsiteFeatures {
    constructor() {
        this.quotes = [
            {
                text: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
                source: "Quran 65:3"
            },
            {
                text: "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth.",
                source: "Quran 6:73"
            },
            {
                text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
                source: "Quran 2:152"
            },
            {
                text: "And whoever fears Allah - He will make for him a way out.",
                source: "Quran 65:2"
            },
            {
                text: "The world is green and beautiful, and Allah has appointed you as His stewards over it.",
                source: "Prophet Muhammad (PBUH)"
            },
            {
                text: "The believer is not one who eats his fill while his neighbor goes hungry.",
                source: "Prophet Muhammad (PBUH)"
            },
            {
                text: "Seek knowledge from the cradle to the grave.",
                source: "Prophet Muhammad (PBUH)"
            },
            {
                text: "And Allah is with the patient.",
                source: "Quran 2:153"
            }
        ];
        
        this.currentQuoteIndex = 0;
        this.init();
    }

    init() {
        this.setupQuoteRotation();
        this.setupBackToTop();
        this.setupReadingProgress();
        this.setupNewsletterForm();
        this.updateStatistics();
        this.setupScrollAnimations();
    }

    // Quote Rotation Feature
    setupQuoteRotation() {
        // Auto-rotate quotes every 10 seconds
        setInterval(() => {
            this.rotateQuote();
        }, 10000);
    }

    rotateQuote() {
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
        const quote = this.quotes[this.currentQuoteIndex];
        
        const quoteText = document.getElementById('quoteText');
        const quoteSource = document.getElementById('quoteSource');
        
        if (quoteText && quoteSource) {
            // Fade out
            quoteText.style.opacity = '0';
            quoteSource.style.opacity = '0';
            
            setTimeout(() => {
                quoteText.textContent = quote.text;
                quoteSource.textContent = `- ${quote.source}`;
                
                // Fade in
                quoteText.style.opacity = '1';
                quoteSource.style.opacity = '1';
            }, 300);
        }
    }

    // Back to Top Button
    setupBackToTop() {
        // Create back to top button
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(backToTopBtn);

        // Show/hide based on scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Smooth scroll to top
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Reading Progress Bar
    setupReadingProgress() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);

        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // Newsletter Form
    setupNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = form.querySelector('.newsletter-input').value;
                
                if (email) {
                    // Simulate newsletter signup
                    this.handleNewsletterSignup(email);
                }
            });
        }
    }

    handleNewsletterSignup(email) {
        // Store in localStorage (in production, send to server)
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
            
            // Show success message
            this.showNotification('✅ Successfully subscribed! JazakAllahu Khair for joining our community.', 'success');
            
            // Clear form
            document.querySelector('.newsletter-input').value = '';
        } else {
            this.showNotification('📧 You are already subscribed to our newsletter.', 'info');
        }
    }

    // Update Statistics
    updateStatistics() {
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        const publishedColumns = columns.filter(col => col.status === 'published').length;
        
        const totalColumnsEl = document.getElementById('totalColumns');
        if (totalColumnsEl) {
            this.animateCounter(totalColumnsEl, publishedColumns);
        }

        // Animate other counters
        const readersEl = document.getElementById('totalReaders');
        if (readersEl) {
            this.animateCounter(readersEl, 1247 + (publishedColumns * 50));
        }

        const questionsEl = document.getElementById('totalQuestions');
        if (questionsEl) {
            const qaItems = JSON.parse(localStorage.getItem('qa_items') || '[]');
            this.animateCounter(questionsEl, qaItems.length || 23);
        }
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 30);
    }

    // Scroll Animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.stat-item, .column-card, .newsletter-card');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 300px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Global function for quote rotation button
function rotateQuote() {
    if (window.websiteFeatures) {
        window.websiteFeatures.rotateQuote();
    }
}

// Global function for hero search
function performHeroSearch() {
    const searchInput = document.getElementById('heroSearchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (query.length >= 2) {
        // Redirect to search results page
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    }
}

// Initialize features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.websiteFeatures = new WebsiteFeatures();
});

// Update statistics when columns change
document.addEventListener('columnsUpdated', function() {
    if (window.websiteFeatures) {
        window.websiteFeatures.updateStatistics();
    }
});