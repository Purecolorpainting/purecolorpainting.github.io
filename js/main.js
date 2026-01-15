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

    grid.innerHTML = filteredItems.map(item => `
        <div class="portfolio-item" data-category="${item.category}">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="overlay">
                <h4>${item.title}</h4>
                ${item.description ? `<p>${item.description}</p>` : ''}
            </div>
        </div>
    `).join('');
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
            <p>${t.text}</p>
            <div class="testimonial-author">${t.author}</div>
            ${t.location ? `<div class="testimonial-location">${t.location}</div>` : ''}
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
 * Initialize contact form handling
 * Note: For a static site, you'll need a form service like Formspree or Netlify Forms
 */
function initContactForm() {
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // For now, show a message - you can integrate with a form service later
            // Options: Formspree (formspree.io), Netlify Forms, EmailJS, etc.
            alert('Thank you for your message! We will get back to you soon.\n\n(Note: To enable form submissions, integrate with a service like Formspree)');

            form.reset();
        });
    }
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
