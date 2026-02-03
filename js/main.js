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
    initPortfolioFilters();
    initContactForm();
    initSmoothScroll();
    initBackToTop();
});

/**
 * Load portfolio items from JSON file
 */
async function loadPortfolio() {
    const grid = document.getElementById('portfolio-grid');

    try {
        const response = await fetch('data/portfolio.json');
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            renderPortfolio(data.items);
        } else {
            grid.innerHTML = '<div class="portfolio-empty"><p>Portfolio coming soon! Check back for photos of our recent projects.</p></div>';
        }
    } catch (error) {
        console.log('Portfolio data not found, showing placeholder');
        grid.innerHTML = '<div class="portfolio-empty"><p>Portfolio coming soon! Check back for photos of our recent projects.</p></div>';
    }
}

/**
 * Render portfolio items to the grid
 */
function renderPortfolio(items, filter = 'all') {
    const grid = document.getElementById('portfolio-grid');
    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.category === filter);

    if (filteredItems.length === 0) {
        grid.innerHTML = '<div class="portfolio-empty"><p>No projects found in this category.</p></div>';
        return;
    }

    grid.innerHTML = filteredItems.map(item => {
        // Check if this is a before/after item
        if (item.beforeImage) {
            return `
                <div class="portfolio-item portfolio-item-comparison" data-category="${item.category}">
                    <div class="comparison-container">
                        <div class="comparison-image comparison-before">
                            <img src="${item.beforeImage}" alt="${item.title} - Before" loading="lazy">
                            <span class="comparison-label">Before</span>
                        </div>
                        <div class="comparison-image comparison-after">
                            <img src="${item.image}" alt="${item.title} - After" loading="lazy">
                            <span class="comparison-label">After</span>
                        </div>
                    </div>
                    <div class="overlay">
                        <h4>${item.title}</h4>
                        ${item.description ? `<p>${item.description}</p>` : ''}
                    </div>
                </div>
            `;
        }
        // Standard single image item
        return `
            <div class="portfolio-item" data-category="${item.category}">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="overlay">
                    <h4>${item.title}</h4>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
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

    grid.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <div class="testimonial-stars">${'&#9733;'.repeat(t.rating || 5)}${'&#9734;'.repeat(5 - (t.rating || 5))}</div>
            <p>${t.text}</p>
            <div class="testimonial-author">${t.author}</div>
            ${t.service ? `<div class="testimonial-location">${t.service}</div>` : ''}
            <div class="google-review-badge">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google Review
            </div>
        </div>
    `).join('');
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });
    }
}

/**
 * Initialize portfolio filter buttons
 */
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter portfolio
            const filter = this.dataset.filter;

            try {
                const response = await fetch('data/portfolio.json');
                const data = await response.json();
                renderPortfolio(data.items, filter);
            } catch (error) {
                console.log('Could not filter portfolio');
            }
        });
    });
}

/**
 * Initialize contact form handling via EmailJS
 */
function initContactForm() {
    emailjs.init('rXH7ds_Pq6j0G0foQ');

    const form = document.getElementById('contact-form');

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

            var service = form.querySelector('#service');

            emailjs.send('service_bwjjwmh', 'template_8n9bi8e', {
                from_name: form.querySelector('#name').value,
                from_email: form.querySelector('#email').value,
                phone: form.querySelector('#phone').value || 'Not provided',
                service: service.options[service.selectedIndex].text,
                message: form.querySelector('#message').value
            }).then(function() {
                submitBtn.textContent = 'Message Sent!';
                form.reset();
                setTimeout(function() {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }, function(error) {
                submitBtn.textContent = 'Failed to Send';
                submitBtn.disabled = false;
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    behavior: 'smooth'
                });
            }
        });
    });
}
