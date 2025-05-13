// Smooth Scroll Utility for Mobile
document.addEventListener('DOMContentLoaded', function() {
    // Enable smooth scrolling for in-page links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            
            // Smoother scrolling with customized behavior
            const offset = 60; // Account for fixed headers
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            // Use native smooth scrolling with fallback
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            } else {
                // Fallback for browsers without smooth scrolling support
                window.scrollTo(0, offsetPosition);
            }
        });
    });
});