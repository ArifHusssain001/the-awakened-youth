// Advanced Features for The Awakened Youth
// Islamic Features, Engagement Tools, and Modern Interactions

// ============================================
// 1. HIJRI DATE DISPLAY (ACCURATE API)
// ============================================
async function displayHijriDate() {
    const hijriDateElement = document.getElementById('hijriDate');
    if (!hijriDateElement) return;
    
    try {
        // Get current date
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        
        // Fetch accurate Hijri date from API
        const response = await fetch(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
        const data = await response.json();
        
        if (data.code === 200) {
            const hijri = data.data.hijri;
            const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
            hijriDateElement.textContent = hijriDate;
            
            // Also show Gregorian date
            const gregorian = data.data.gregorian;
            const gregorianDate = `${gregorian.day} ${gregorian.month.en} ${gregorian.year}`;
            
            // Update with both dates
            hijriDateElement.innerHTML = `
                <div style="font-size: 1.1rem; font-weight: 600;">${hijriDate}</div>
                <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">${gregorianDate}</div>
            `;
        }
    } catch (error) {
        // Fallback to approximate calculation
        hijriDateElement.textContent = getApproximateHijriDate();
    }
}

function getApproximateHijriDate() {
    const today = new Date();
    const gregorianYear = today.getFullYear();
    const gregorianMonth = today.getMonth();
    const gregorianDay = today.getDate();
    
    // Approximate Hijri calculation
    const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
    const hijriMonths = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 
                         'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 
                         'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'];
    const hijriMonth = hijriMonths[gregorianMonth % 12];
    
    return `${gregorianDay} ${hijriMonth} ${hijriYear} AH`;
}

// ============================================
// 2. QURAN VERSE OF THE DAY
// ============================================
async function displayVerseOfDay() {
    const verseElement = document.getElementById('verseOfDay');
    if (!verseElement) return;
    
    const verses = [
        { text: "And whoever relies upon Allah - then He is sufficient for him.", ref: "Quran 65:3" },
        { text: "Indeed, with hardship comes ease.", ref: "Quran 94:6" },
        { text: "So remember Me; I will remember you.", ref: "Quran 2:152" },
        { text: "Allah does not burden a soul beyond that it can bear.", ref: "Quran 2:286" },
        { text: "Verily, in the remembrance of Allah do hearts find rest.", ref: "Quran 13:28" }
    ];
    
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const verse = verses[dayOfYear % verses.length];
    
    verseElement.innerHTML = `
        <blockquote class="verse-text">"${verse.text}"</blockquote>
        <cite class="verse-ref">— ${verse.ref}</cite>
    `;
}

// ============================================
// 4. READING TIME ESTIMATOR
// ============================================
function calculateReadingTime() {
    const articles = document.querySelectorAll('.column-content, .column-card-excerpt');
    
    articles.forEach(article => {
        const text = article.textContent;
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
        
        const timeElement = document.createElement('span');
        timeElement.className = 'reading-time';
        timeElement.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg> ${readingTime} min read`;
        
        const parent = article.closest('.column-card');
        if (parent && !parent.querySelector('.reading-time')) {
            parent.querySelector('.column-card-title').after(timeElement);
        }
    });
}

// ============================================
// 5. SHARE BUTTONS
// ============================================
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.dataset.platform;
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl = '';
            
            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${title}%20${url}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

// ============================================
// 6. SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.column-card, .stat-item, .newsletter-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// ============================================
// 7. TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// 8. VIEW COUNTER
// ============================================
function incrementViewCount() {
    const viewCountElement = document.getElementById('viewCount');
    if (!viewCountElement) return;
    
    const pageKey = `views_${window.location.pathname}`;
    let views = parseInt(localStorage.getItem(pageKey) || '0');
    views++;
    localStorage.setItem(pageKey, views);
    
    viewCountElement.textContent = views.toLocaleString();
}

// ============================================
// 9. NEWSLETTER POPUP
// ============================================
function initNewsletterPopup() {
    const hasSeenPopup = localStorage.getItem('newsletterPopupSeen');
    
    if (!hasSeenPopup) {
        setTimeout(() => {
            showNewsletterPopup();
        }, 10000); // Show after 10 seconds
    }
}

function showNewsletterPopup() {
    const popup = document.createElement('div');
    popup.className = 'newsletter-popup';
    popup.innerHTML = `
        <div class="newsletter-popup-content">
            <button class="popup-close" onclick="closeNewsletterPopup()">&times;</button>
            <h3>📧 Stay Connected</h3>
            <p>Subscribe to receive Islamic insights and new columns directly in your inbox.</p>
            <form class="popup-form" onsubmit="subscribeNewsletter(event)">
                <input type="email" placeholder="Enter your email" required>
                <button type="submit">Subscribe</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('show'), 100);
}

function closeNewsletterPopup() {
    const popup = document.querySelector('.newsletter-popup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
        localStorage.setItem('newsletterPopupSeen', 'true');
    }
}

function subscribeNewsletter(e) {
    e.preventDefault();
    showToast('Thank you for subscribing! 🎉', 'success');
    closeNewsletterPopup();
}

// ============================================
// 10. STICKY HEADER ON SCROLL
// ============================================
function initStickyHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('header-scrolled');
            
            if (currentScroll > lastScroll) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
        } else {
            header.classList.remove('header-scrolled', 'header-hidden');
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// INITIALIZE ALL FEATURES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    displayHijriDate();
    displayVerseOfDay();
    calculateReadingTime();
    initShareButtons();
    initScrollAnimations();
    incrementViewCount();
    initNewsletterPopup();
    initStickyHeader();
    
    console.log('✨ Advanced features loaded successfully!');
});
