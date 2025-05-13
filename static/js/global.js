/**
 * Global JavaScript for enhancing UI elements and interactions
 * across all pages of Infranaut.ai
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if this page should use standardized styling
    const shouldStandardize = document.body.classList.contains('use-standard-styling');
    
    // Only apply these standardizations if explicitly requested
    if (shouldStandardize) {
        // Apply gradient text effect to all headings and titles based on level
        const headings = document.querySelectorAll('h1, h2, h3, h4, .title');
        
        headings.forEach(heading => {
            // Skip headings that already have styling
            if (heading.querySelector('.gradient-text') || 
                heading.classList.contains('gradient-text') ||
                heading.classList.contains('gradient-text-hover') ||
                heading.classList.contains('gradient-text-primary') ||
                heading.classList.contains('gradient-text-secondary') ||
                heading.classList.contains('gradient-text-accent') ||
                heading.classList.contains('gradient-text-workflow') ||
                heading.classList.contains('gradient-text-cloud') ||
                heading.classList.contains('gradient-text-about') ||
                heading.classList.contains('text-gradient') ||
                getComputedStyle(heading).webkitBackgroundClip === 'text') {
                return;
            }

            // Don't apply to specific elements that shouldn't have gradient (like in footers)
            if (heading.closest('footer') || heading.closest('.navbar')) {
                return;
            }

            // Apply appropriate gradient class based on heading level
            if (heading.tagName === 'H1' || heading.classList.contains('title') && heading.classList.contains('is-1')) {
                heading.classList.add('gradient-text-primary');
            } else if (heading.tagName === 'H2' || heading.classList.contains('title') && heading.classList.contains('is-2')) {
                heading.classList.add('gradient-text-primary');
            } else if (heading.tagName === 'H3' || heading.classList.contains('title') && (heading.classList.contains('is-3') || heading.classList.contains('is-4'))) {
                heading.classList.add('gradient-text-secondary');
            } else {
                heading.classList.add('gradient-text-accent');
            }
            
            // Add hover effect to important headings only
            if (heading.tagName === 'H1' || heading.tagName === 'H2') {
                heading.classList.add('gradient-text-hover');
            }
        });

        // Add proper class to sections that should have gradient backgrounds
        const sections = document.querySelectorAll('section:not(.standard-section)');
        sections.forEach(section => {
            if (section.classList.contains('hero') || 
                section.classList.contains('bg-light') || 
                section.classList.contains('section')) {
                section.classList.add('standard-section');
            }
        });

        // Convert existing buttons to use unified styling
        const primaryButtons = document.querySelectorAll('.button.is-primary, .infra-primary-btn');
        primaryButtons.forEach(button => {
            if (!button.classList.contains('primary-btn')) {
                button.classList.add('primary-btn');
            }
        });

        const secondaryButtons = document.querySelectorAll('.button.is-link, .button.is-info');
        secondaryButtons.forEach(button => {
            if (!button.classList.contains('secondary-btn')) {
                button.classList.add('secondary-btn');
            }
        });

        const outlinedButtons = document.querySelectorAll('.button.is-outlined, .infra-outlined-btn');
        outlinedButtons.forEach(button => {
            if (!button.classList.contains('outlined-btn')) {
                button.classList.add('outlined-btn');
            }
        });

        // Convert feature cards to use unified styling
        const featureCards = document.querySelectorAll('.card, .infra-feature-card, .devops-feature-card, .cloud-feature-card, .code-feature-card');
        featureCards.forEach(card => {
            if (!card.classList.contains('feature-card') && 
                !card.classList.contains('code-feature-card') &&
                !card.classList.contains('code-sample')) {
                card.classList.add('feature-card');
            }
        });
    }

    // Add gradient background to specific elements - this applies regardless of standardization
    document.querySelectorAll('.has-gradient-background').forEach(element => {
        if (element.classList.contains('primary')) {
            element.style.background = 'var(--gradient-primary)';
        } else if (element.classList.contains('secondary')) {
            element.style.background = 'var(--gradient-secondary)';
        } else {
            element.style.background = 'var(--gradient-accent)';
        }
    });

    // Apply animations to slide-in-up elements - keep animations for all pages
    const slideInElements = document.querySelectorAll('.slide-in-up');
    slideInElements.forEach(element => {
        element.classList.add('pre-animation');
        
        // Get delay from data-delay attribute if present
        if (element.dataset.delay) {
            element.style.transitionDelay = element.dataset.delay;
        }
    });

    // Add animation to elements when they come into view - keep animations for all pages
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-element');
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements that should animate on scroll - apply only to those with pre-animation class
    const animateElements = document.querySelectorAll('.pre-animation, .slide-in-up, .reveal-on-scroll');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Add responsive behavior for columns on smaller screens - keep for all pages
    function handleResponsiveLayout() {
        if (window.innerWidth <= 768) {
            const columns = document.querySelectorAll('.columns:not(.is-mobile)');
            columns.forEach(column => {
                if (!column.classList.contains('is-multiline')) {
                    column.classList.add('is-multiline');
                }
            });
        }
    }

    // Initial call and window resize listener
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .pre-animation {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-element,
    .slide-in-up.is-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    @media (prefers-reduced-motion: reduce) {
        .pre-animation,
        .slide-in-up {
            transition: none;
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style); 