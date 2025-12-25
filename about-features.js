// Interactive About Page Features
class AboutPageFeatures {
    constructor() {
        this.currentQuoteIndex = 0;
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
                text: "And Allah is with the patient.",
                source: "Quran 2:153"
            }
        ];
        
        this.init();
    }

    init() {
        this.setupTimelineAnimations();
        this.setupQuotesCarousel();
        this.setupValueCards();
        this.updateStatistics();
        this.setupScrollAnimations();
        this.setupExpertiseCards();
        this.setupTestimonials();
        this.addParallaxEffect();
        this.setupJourneyCards();
    }

    // Timeline Animations
    setupTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, index * 200);
                }
            });
        }, {
            threshold: 0.3
        });

        timelineItems.forEach(item => {
            observer.observe(item);
        });
    }

    // Quotes Carousel
    setupQuotesCarousel() {
        this.createCarouselDots();
        this.startAutoRotation();
    }

    createCarouselDots() {
        const dotsContainer = document.getElementById('carouselDots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.quotes.length; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToQuote(i));
            dotsContainer.appendChild(dot);
        }
    }

    changeQuote(direction) {
        const slides = document.querySelectorAll('.quote-slide');
        const dots = document.querySelectorAll('.dot');
        
        if (slides.length === 0) return;

        // Remove active class from current slide and dot
        slides[this.currentQuoteIndex].classList.remove('active');
        dots[this.currentQuoteIndex].classList.remove('active');

        // Calculate new index
        this.currentQuoteIndex += direction;
        if (this.currentQuoteIndex >= this.quotes.length) {
            this.currentQuoteIndex = 0;
        } else if (this.currentQuoteIndex < 0) {
            this.currentQuoteIndex = this.quotes.length - 1;
        }

        // Update slide content and activate
        this.updateQuoteSlide();
        slides[this.currentQuoteIndex].classList.add('active');
        dots[this.currentQuoteIndex].classList.add('active');
    }

    goToQuote(index) {
        const slides = document.querySelectorAll('.quote-slide');
        const dots = document.querySelectorAll('.dot');
        
        if (slides.length === 0) return;

        // Remove active classes
        slides[this.currentQuoteIndex].classList.remove('active');
        dots[this.currentQuoteIndex].classList.remove('active');

        // Set new index
        this.currentQuoteIndex = index;

        // Update and activate
        this.updateQuoteSlide();
        slides[this.currentQuoteIndex].classList.add('active');
        dots[this.currentQuoteIndex].classList.add('active');
    }

    updateQuoteSlide() {
        const activeSlide = document.querySelector('.quote-slide.active');
        if (!activeSlide) return;

        const quote = this.quotes[this.currentQuoteIndex];
        const blockquote = activeSlide.querySelector('blockquote');
        const cite = activeSlide.querySelector('cite');

        if (blockquote && cite) {
            blockquote.textContent = `"${quote.text}"`;
            cite.textContent = `- ${quote.source}`;
        }
    }

    startAutoRotation() {
        setInterval(() => {
            this.changeQuote(1);
        }, 5000); // Change every 5 seconds
    }

    // Value Cards Interactions
    setupValueCards() {
        const valueCards = document.querySelectorAll('.value-card');
        
        valueCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateValueCard(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateValueCard(card, false);
            });

            card.addEventListener('click', () => {
                this.showValueDetails(card.dataset.value);
            });
        });
    }

    animateValueCard(card, isHover) {
        const icon = card.querySelector('.value-icon');
        
        if (isHover) {
            icon.style.transform = 'scale(1.2) rotate(10deg)';
            card.style.background = 'linear-gradient(135deg, var(--surface) 0%, var(--border) 100%)';
        } else {
            icon.style.transform = 'scale(1) rotate(0deg)';
            card.style.background = 'var(--bg)';
        }
    }

    showValueDetails(value) {
        const valueDetails = {
            compassion: {
                title: "Compassion in Writing",
                description: "Every word is written with understanding and empathy for the challenges faced by young Muslims in today's world. I believe in gentle guidance rather than harsh judgment."
            },
            authenticity: {
                title: "Authentic Islamic Voice",
                description: "Staying true to the Quran and Sunnah while addressing modern challenges. Authenticity means being honest about struggles while maintaining hope in Allah's guidance."
            },
            guidance: {
                title: "Practical Guidance",
                description: "Providing actionable Islamic wisdom that can be applied in daily life. From prayer and relationships to career and personal growth - Islam has guidance for everything."
            },
            hope: {
                title: "Inspiring Hope",
                description: "No matter how lost someone feels, there is always hope in Allah's mercy. My writing aims to remind hearts of this beautiful truth and inspire positive change."
            }
        };

        const detail = valueDetails[value];
        if (detail) {
            this.showModal(detail.title, detail.description);
        }
    }

    showModal(title, description) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'value-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="this.closest('.value-modal').remove()">×</button>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="modal-actions">
                        <button onclick="this.closest('.value-modal').remove()" class="modal-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
        `;

        const overlay = modal.querySelector('.modal-overlay');
        overlay.style.cssText = `
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            background: var(--bg);
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 100%;
            position: relative;
            border: 1px solid var(--border);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        `;

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--muted);
        `;

        const modalBtn = modal.querySelector('.modal-btn');
        modalBtn.style.cssText = `
            background: var(--accent);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
        `;

        document.body.appendChild(modal);
    }

    // Update Statistics
    updateStatistics() {
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        const publishedColumns = columns.filter(col => col.status === 'published').length;
        
        const columnsCountEl = document.getElementById('aboutColumnsCount');
        if (columnsCountEl) {
            this.animateCounter(columnsCountEl, publishedColumns);
        }
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = Math.max(1, target / 30);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 50);
    }

    // Scroll Animations
    setupScrollAnimations() {
        const animateElements = document.querySelectorAll('.writer-profile-card, .value-card, .cta-card, .mission-statement');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // Expertise Cards Animation
    setupExpertiseCards() {
        const expertiseCards = document.querySelectorAll('.expertise-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, {
            threshold: 0.2
        });

        expertiseCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            observer.observe(card);
        });
    }

    // Testimonials Animation
    setupTestimonials() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                    }, index * 150);
                }
            });
        }, {
            threshold: 0.2
        });

        testimonialCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            card.style.transition = 'all 0.5s ease';
            observer.observe(card);
        });
    }

    // Parallax Effect for Profile Card
    addParallaxEffect() {
        const profileCard = document.querySelector('.writer-profile-card');
        if (!profileCard) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            if (scrolled < 500) {
                profileCard.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Journey Cards Animation
    setupJourneyCards() {
        const journeyCards = document.querySelectorAll('.journey-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                    }, index * 150);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        journeyCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px) scale(0.95)';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(card);
        });
    }
}

// Global functions for carousel controls
function changeQuote(direction) {
    if (window.aboutFeatures) {
        window.aboutFeatures.changeQuote(direction);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on about page
    if (document.querySelector('.writer-profile-card')) {
        window.aboutFeatures = new AboutPageFeatures();
        
        // Add smooth page load animation
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
});

// Update statistics when columns change
document.addEventListener('columnsUpdated', function() {
    if (window.aboutFeatures) {
        window.aboutFeatures.updateStatistics();
    }
});