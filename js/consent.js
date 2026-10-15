/**
 * Pure Color Painting - Cookie Consent
 * Shows the cookie banner and updates Google Analytics consent.
 * The default (denied until accepted) is set in the <head> of index.html.
 */

(function() {
    var STORAGE_KEY = 'pcp_cookie_consent';

    function getConsent() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function saveConsent(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {}

        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                analytics_storage: value === 'granted' ? 'granted' : 'denied'
            });
        }

        if (value === 'denied') {
            removeAnalyticsCookies();
        }
    }

    // Clear Google Analytics cookies left over from an earlier "Accept"
    function removeAnalyticsCookies() {
        var host = location.hostname.replace(/^www\./, '');
        document.cookie.split(';').forEach(function(cookie) {
            var name = cookie.split('=')[0].trim();
            if (name.indexOf('_ga') === 0) {
                document.cookie = name + '=; Max-Age=0; path=/';
                document.cookie = name + '=; Max-Age=0; path=/; domain=.' + host;
            }
        });
    }

    function showBanner(returnFocusTo) {
        if (document.getElementById('cookie-banner')) return;

        var banner = document.createElement('section');
        banner.className = 'cookie-banner';
        banner.id = 'cookie-banner';
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.innerHTML =
            '<p>We use cookies from Google Analytics to understand how visitors use our site. ' +
            'They are only set if you accept. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
            '<div class="cookie-banner-actions">' +
                '<button type="button" class="btn btn-outline" data-consent="denied">Decline</button>' +
                '<button type="button" class="btn btn-primary" data-consent="granted">Accept</button>' +
            '</div>';

        banner.addEventListener('click', function(e) {
            var choice = e.target.getAttribute('data-consent');
            if (!choice) return;

            saveConsent(choice);
            banner.remove();
            if (returnFocusTo) {
                returnFocusTo.focus();
            }
        });

        // Place the banner right after the skip link so keyboard users reach it early
        var skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.insertAdjacentElement('afterend', banner);
        } else {
            document.body.insertBefore(banner, document.body.firstChild);
        }

        // When reopened from "Cookie Settings", move focus into the banner
        if (returnFocusTo) {
            banner.querySelector('button').focus();
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        var consent = getConsent();

        // Treat the browser's Global Privacy Control signal as a decline
        if (!consent && navigator.globalPrivacyControl) {
            saveConsent('denied');
            consent = 'denied';
        }

        if (!consent) {
            showBanner(null);
        }

        document.querySelectorAll('[data-cookie-settings]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                showBanner(btn);
            });
        });
    });
})();
