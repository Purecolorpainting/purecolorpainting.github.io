/**
 * Pure Color Painting - Main JavaScript
 * Handles dynamic content loading and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Load dynamic content
    loadPortfolio();
    loadTestimonials();

    // Initialize components
    initMobileMenu();
    initPortfolioCarousel();
    initPortfolioDialog();
    initPortfolioFilters();
    initContactForm();
    initSmoothScroll();
    initBackToTop();
});

/**
 * Respect the visitor's reduced motion setting for scripted scrolling
 */
function scrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * Portfolio state shared by the carousel and the "View All" grid
 */
const PORTFOLIO_ROTATE_MS = 6000;
const PORTFOLIO_EMPTY = '<div class="portfolio-empty"><p>Portfolio coming soon! Check back for photos of our recent projects.</p></div>';
const PORTFOLIO_CATEGORY_LABELS = {
    residential: 'Residential',
    commercial: 'Commercial',
    decks: 'Decks'
};
const PORTFOLIO_NONE_IN_CATEGORY = '<div class="portfolio-empty"><p>No projects found in this category.</p></div>';

const portfolio = {
    items: [],
    slides: [],
    index: 0,
    timer: null,
    paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    hovered: false,
    dialogOpen: false
};

/**
 * Load portfolio items from JSON file
 */
async function loadPortfolio() {
    try {
        const response = await fetch('data/portfolio.json');
        const data = await response.json();
        portfolio.items = data.items || [];
    } catch (error) {
        console.log('Portfolio data not found, showing placeholder');
    }
    applyPortfolioFilter('all');
}

/**
 * Narrow the carousel and grid to one category
 */
function applyPortfolioFilter(filter) {
    portfolio.slides = filter === 'all'
        ? portfolio.items
        : portfolio.items.filter(item => item.category === filter);

    renderPortfolioGrid();
    showSlide(0);
}

/**
 * Build the markup for one carousel slide
 */
function slideMarkup(item) {
    if (item.beforeImage) {
        return `
            <div class="slide slide-comparison">
                <div class="comparison-image comparison-before">
                    <img src="${item.beforeImage}" alt="${item.title} - Before">
                    <span class="comparison-label">Before</span>
                </div>
                <div class="comparison-image comparison-after">
                    <img src="${item.image}" alt="${item.title} - After">
                    <span class="comparison-label">After</span>
                </div>
            </div>
        `;
    }
    // Single photos sit over a blurred copy so they fill the stage without cropping
    return `
        <div class="slide slide-single">
            <img class="slide-backdrop" src="${item.image}" alt="" aria-hidden="true">
            <img class="slide-photo" src="${item.image}" alt="${item.title}">
        </div>
    `;
}

/**
 * Show the slide at the given index (wraps around at either end)
 */
function showSlide(index) {
    const carousel = document.getElementById('portfolio-carousel');
    const stage = document.getElementById('carousel-stage');
    const caption = document.getElementById('carousel-caption');
    const counter = document.getElementById('carousel-counter');
    const slides = portfolio.slides;

    carousel.classList.toggle('is-empty', slides.length === 0);
    carousel.classList.toggle('is-single', slides.length < 2);

    if (slides.length === 0) {
        stage.innerHTML = portfolio.items.length === 0 ? PORTFOLIO_EMPTY : PORTFOLIO_NONE_IN_CATEGORY;
        caption.innerHTML = '';
        counter.textContent = '';
        restartRotation();
        return;
    }

    portfolio.index = (index + slides.length) % slides.length;

    const item = slides[portfolio.index];
    stage.innerHTML = slideMarkup(item);
    caption.innerHTML = `<h3>${item.title}</h3>${item.description ? `<p>${item.description}</p>` : ''}`;
    counter.textContent = `${portfolio.index + 1} / ${slides.length}`;

    // Preload the next slide so rotation doesn't flash a blank stage
    const next = slides[(portfolio.index + 1) % slides.length];
    [next.image, next.beforeImage].filter(Boolean).forEach(src => {
        new Image().src = src;
    });

    restartRotation();
}

/**
 * Schedule the next automatic advance, unless rotation is paused
 */
function restartRotation() {
    clearTimeout(portfolio.timer);
    portfolio.timer = null;

    const rotating = !portfolio.paused && !portfolio.hovered && !portfolio.dialogOpen && portfolio.slides.length > 1;
    if (rotating) {
        portfolio.timer = setTimeout(() => showSlide(portfolio.index + 1), PORTFOLIO_ROTATE_MS);
    }

    // Only announce slide changes to screen readers when the visitor is driving
    document.getElementById('carousel-caption').setAttribute('aria-live', rotating ? 'off' : 'polite');
}

/**
 * Render every project in the current category to the "View All" grid
 */
function renderPortfolioGrid() {
    const grid = document.getElementById('portfolio-grid');
    const slides = portfolio.slides;

    if (slides.length === 0) {
        grid.innerHTML = portfolio.items.length === 0 ? PORTFOLIO_EMPTY : PORTFOLIO_NONE_IN_CATEGORY;
        return;
    }

    // Group by category so each type gets its own heading; indexes still point into portfolio.slides
    const groups = {};
    slides.forEach((item, i) => {
        (groups[item.category] = groups[item.category] || []).push({ item, i });
    });

    grid.innerHTML = Object.keys(PORTFOLIO_CATEGORY_LABELS)
        .concat(Object.keys(groups).filter(c => !(c in PORTFOLIO_CATEGORY_LABELS)))
        .filter(category => groups[category])
        .map(category => `
            <section class="portfolio-group">
                <h3 class="portfolio-group-title">${PORTFOLIO_CATEGORY_LABELS[category] || category}</h3>
                <div class="portfolio-grid">
                    ${groups[category].map(({ item, i }) => portfolioGridItemMarkup(item, i)).join('')}
                </div>
            </section>
        `).join('');
}

/**
 * Build the markup for one clickable project in the "View All" grid
 */
function portfolioGridItemMarkup(item, i) {
    const overlay = `
        <span class="overlay">
            <span class="overlay-title">${item.title}</span>
            ${item.description ? `<span class="overlay-desc">${item.description}</span>` : ''}
        </span>
    `;
    // Check if this is a before/after item
    if (item.beforeImage) {
        return `
            <button type="button" class="portfolio-item portfolio-item-comparison" data-index="${i}" aria-label="View ${item.title}">
                <span class="comparison-container">
                    <span class="comparison-image comparison-before">
                        <img src="${item.beforeImage}" alt="" loading="lazy">
                        <span class="comparison-label">Before</span>
                    </span>
                    <span class="comparison-image comparison-after">
                        <img src="${item.image}" alt="" loading="lazy">
                        <span class="comparison-label">After</span>
                    </span>
                </span>
                ${overlay}
            </button>
        `;
    }
    // Standard single image item
    return `
        <button type="button" class="portfolio-item" data-index="${i}" aria-label="View ${item.title}">
            <img src="${item.image}" alt="" loading="lazy">
            ${overlay}
        </button>
    `;
}

/**
 * Initialize carousel arrows, pause button, swipe, and keyboard controls
 */
function initPortfolioCarousel() {
    const carousel = document.getElementById('portfolio-carousel');
    const stage = document.getElementById('carousel-stage');
    const pauseBtn = document.getElementById('carousel-pause');

    carousel.querySelector('.carousel-prev').addEventListener('click', () => showSlide(portfolio.index - 1));
    carousel.querySelector('.carousel-next').addEventListener('click', () => showSlide(portfolio.index + 1));

    function updatePauseBtn() {
        pauseBtn.innerHTML = portfolio.paused ? '&#9654;' : '&#10074;&#10074;';
        pauseBtn.setAttribute('aria-label', portfolio.paused ? 'Play slideshow' : 'Pause slideshow');
    }
    updatePauseBtn();

    pauseBtn.addEventListener('click', function() {
        portfolio.paused = !portfolio.paused;
        updatePauseBtn();
        restartRotation();
    });

    // Hold still while the visitor is looking at or using the carousel
    function setHovered(hovered) {
        portfolio.hovered = hovered;
        restartRotation();
    }
    carousel.addEventListener('mouseenter', () => setHovered(true));
    carousel.addEventListener('mouseleave', () => setHovered(false));
    carousel.addEventListener('focusin', () => setHovered(true));
    carousel.addEventListener('focusout', e => {
        if (!carousel.contains(e.relatedTarget)) setHovered(false);
    });

    carousel.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') showSlide(portfolio.index - 1);
        if (e.key === 'ArrowRight') showSlide(portfolio.index + 1);
    });

    let touchStartX = null;
    stage.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchend', e => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) > 40) showSlide(portfolio.index + (dx < 0 ? 1 : -1));
    });
}

/**
 * Initialize the "View All" dialog; picking a project shows it in the carousel
 */
function initPortfolioDialog() {
    const dialog = document.getElementById('portfolio-dialog');
    const grid = document.getElementById('portfolio-grid');

    document.getElementById('view-all-btn').addEventListener('click', function() {
        dialog.showModal();
        document.documentElement.classList.add('dialog-open');
        portfolio.dialogOpen = true;
        restartRotation();
    });

    dialog.addEventListener('close', function() {
        document.documentElement.classList.remove('dialog-open');
        portfolio.dialogOpen = false;
        restartRotation();
    });

    dialog.querySelector('.portfolio-dialog-close').addEventListener('click', () => dialog.close());

    // Clicking the dimmed backdrop closes the dialog
    dialog.addEventListener('click', e => {
        if (e.target === dialog) dialog.close();
    });

    grid.addEventListener('click', e => {
        const item = e.target.closest('[data-index]');
        if (!item) return;
        dialog.close();
        showSlide(Number(item.dataset.index));
    });
}

/**
 * Load testimonials from JSON file
 */
async function loadTestimonials() {
    const grid = document.getElementById('testimonials-grid');

    try {
        const response = await fetch('data/testimonials.json');
        const data = await response.json();

        if (data.testimonials && data.testimonials.length > 0) {
            renderTestimonials(data.testimonials);
        } else {
            grid.innerHTML = '<div class="testimonials-empty"><p>Customer testimonials coming soon!</p></div>';
        }
    } catch (error) {
        console.log('Testimonials data not found, showing placeholder');
        grid.innerHTML = '<div class="testimonials-empty"><p>Customer testimonials coming soon!</p></div>';
    }
}

/**
 * Render testimonials to the grid
 */
function renderTestimonials(testimonials) {
    const grid = document.getElementById('testimonials-grid');

    grid.innerHTML = testimonials.map(t => {
        const rating = t.rating || 5;
        return `
        <div class="testimonial-card">
            <div class="testimonial-stars" role="img" aria-label="Rated ${rating} out of 5 stars">${'&#9733;'.repeat(rating)}${'&#9734;'.repeat(5 - rating)}</div>
            <p>${t.text}</p>
            <div class="testimonial-author">${t.author}</div>
            ${t.service ? `<div class="testimonial-location">${t.service}</div>` : ''}
        </div>
    `;
    }).join('');
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (menuBtn && nav) {
        function closeMenu() {
            nav.classList.remove('active');
            menuBtn.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        }

        menuBtn.addEventListener('click', function() {
            const isOpen = nav.classList.toggle('active');
            this.classList.toggle('active', isOpen);
            this.setAttribute('aria-expanded', String(isOpen));
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu with Escape and return focus to the button
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                closeMenu();
                menuBtn.focus();
            }
        });
    }
}

/**
 * Initialize portfolio filter buttons (the section and dialog sets stay in sync)
 */
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;

            filterBtns.forEach(b => {
                const active = b.dataset.filter === filter;
                b.classList.toggle('active', active);
                b.setAttribute('aria-pressed', String(active));
            });

            applyPortfolioFilter(filter);
        });
    });
}

/**
 * Spam filter lists for the contact form. Add new entries in lowercase.
 * Domains also match their subdomains (e.g. "mail.tramelcrow.com").
 */
var BLOCKED_EMAIL_DOMAINS = [
    'tramelcrow.com' // Phishing look-alike of trammellcrow.com
];

var BLOCKED_KEYWORDS = [
    'cedar ridge',
    'bidding process',
    'qualified and reliable contractors'
];

// Real people take longer than this to fill out the form
var MIN_FILL_TIME_MS = 3000;

/**
 * Returns a short reason code if the submission looks like spam, otherwise null.
 * Reason codes (not the matched term) are logged so the console doesn't reveal the list.
 */
function getSpamReason(fields, formLoadedAt) {
    if (fields.honeypot) {
        return 'honeypot';
    }

    if (Date.now() - formLoadedAt < MIN_FILL_TIME_MS) {
        return 'too-fast';
    }

    var email = fields.email.trim().toLowerCase();
    var domain = email.substring(email.lastIndexOf('@') + 1);
    var domainBlocked = BLOCKED_EMAIL_DOMAINS.some(function(blocked) {
        return domain === blocked || domain.endsWith('.' + blocked);
    });
    if (domainBlocked) {
        return 'domain';
    }

    // Collapse whitespace so line breaks or double spaces can't dodge a phrase match
    var text = (fields.name + ' ' + fields.message).toLowerCase().replace(/\s+/g, ' ');
    var keywordBlocked = BLOCKED_KEYWORDS.some(function(keyword) {
        return text.indexOf(keyword) !== -1;
    });
    if (keywordBlocked) {
        return 'keyword';
    }

    return null;
}

/**
 * Initialize contact form handling via EmailJS
 */
function initContactForm() {
    emailjs.init('rXH7ds_Pq6j0G0foQ');

    const form = document.getElementById('contact-form');
    var formLoadedAt = Date.now();

    if (form) {
        var phoneInput = form.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                var digits = this.value.replace(/\D/g, '').substring(0, 10);
                if (digits.length >= 7) {
                    this.value = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6);
                } else if (digits.length >= 4) {
                    this.value = '(' + digits.substring(0, 3) + ') ' + digits.substring(3);
                } else if (digits.length > 0) {
                    this.value = '(' + digits;
                }
            });
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            var formError = form.querySelector('#form-error');
            var formStatus = form.querySelector('#form-status');
            formError.hidden = true;
            formStatus.textContent = 'Sending your message...';

            var service = form.querySelector('#service');
            var honeypot = form.querySelector('#website');
            var fields = {
                name: form.querySelector('#name').value,
                email: form.querySelector('#email').value,
                phone: form.querySelector('#phone').value,
                message: form.querySelector('#message').value,
                honeypot: honeypot ? honeypot.value : ''
            };

            function showSent() {
                submitBtn.textContent = 'Message Sent!';
                formStatus.textContent = 'Thank you! Your message has been sent. We will be in touch soon.';
                form.reset();
                setTimeout(function() {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }

            // Spam gets the same success UI but never reaches EmailJS (saves monthly quota)
            var spamReason = getSpamReason(fields, formLoadedAt);
            if (spamReason) {
                console.warn('initContactForm@submit: submission filtered', { reason: spamReason });
                setTimeout(showSent, 800);
                return;
            }

            emailjs.send('service_bwjjwmh', 'template_8n9bi8e', {
                from_name: fields.name,
                from_email: fields.email,
                phone: fields.phone || 'Not provided',
                service: service.options[service.selectedIndex].text,
                message: fields.message
            }).then(showSent, function(error) {
                submitBtn.textContent = 'Failed to Send';
                submitBtn.disabled = false;
                formStatus.textContent = '';
                formError.hidden = false;
                console.error('EmailJS error:', error);
                setTimeout(function() {
                    submitBtn.textContent = originalText;
                }, 3000);
            });
        });
    }
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
        // Move keyboard focus back to the top of the page too
        document.querySelector('.skip-link').focus({ preventScroll: true });
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: scrollBehavior()
                });

                // Move keyboard focus to the section so the next Tab continues from there
                if (!target.hasAttribute('tabindex')) {
                    target.setAttribute('tabindex', '-1');
                }
                target.focus({ preventScroll: true });
            }
        });
    });
}
