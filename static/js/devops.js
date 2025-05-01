document.addEventListener('DOMContentLoaded', function() {
    // Handle scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    // Handle tool grid scrolling
    const toolsGrid = document.querySelector('.devops-tools-grid');
    if (toolsGrid) {
        let isScrolling;
        let startY;
        let startScrollTop;
        let initialTouchY;

        // Touch start handler
        toolsGrid.addEventListener('touchstart', (e) => {
            startY = e.touches[0].pageY;
            initialTouchY = e.touches[0].pageY;
            startScrollTop = toolsGrid.scrollTop;
            isScrolling = true;
        }, { passive: true });

        // Touch move handler
        toolsGrid.addEventListener('touchmove', (e) => {
            if (!isScrolling) return;
            
            const currentY = e.touches[0].pageY;
            const deltaY = startY - currentY;
            toolsGrid.scrollTop = startScrollTop + deltaY;
            
            startY = currentY;
        }, { passive: true });

        // Touch end handler
        toolsGrid.addEventListener('touchend', () => {
            isScrolling = false;
        }, { passive: true });
    }

    // Add hover effect to feature cards
    document.querySelectorAll('.devops-feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});