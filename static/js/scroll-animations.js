document.addEventListener('DOMContentLoaded', function() {
    // Animation classes that will be triggered on scroll
    const animationClasses = [
        '.fade-in', 
        '.slide-in-up', 
        '.rotate-in', 
        '.card-3d-effect',
        '.perspective-shadow',
        '.depth-effect'
    ];

    // Function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // Element is considered in viewport when it's top is at 75% of window height
        const threshold = windowHeight * 0.25;
        
        return (
            rect.top <= windowHeight - threshold &&
            rect.bottom >= 0
        );
    }

    // Apply 3D tilt effect to cards
    document.querySelectorAll('.card-3d-effect').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            // Calculate mouse position relative to card center
            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;
            
            // Convert to rotation degrees (max 10 degrees)
            const rotateY = mouseX * 10 / (cardRect.width / 2);
            const rotateX = -mouseY * 10 / (cardRect.height / 2);
            
            // Apply transformation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        // Reset on mouse leave
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // Apply parallax effect to elements with parallax class
    const parallaxElements = document.querySelectorAll('.parallax');
    
    function updateParallax() {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-parallax-speed') || 0.5;
            const yPos = -(scrollTop * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }

    // Add flowing border effect to elements
    document.querySelectorAll('.flowing-border').forEach(el => {
        // Create an animated background gradient
        const borderWidth = el.getAttribute('data-border-width') || '2px';
        const borderStyle = el.getAttribute('data-border-style') || 'solid';
        
        el.style.borderWidth = borderWidth;
        el.style.borderStyle = borderStyle;
    });

    // Apply interactive effects to mouse position sensitive elements
    document.querySelectorAll('.mouse-position-effect').forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const rect = el.getBoundingClientRect();
            
            // Calculate mouse position as percentage of element width/height
            const xPos = (e.clientX - rect.left) / rect.width;
            const yPos = (e.clientY - rect.top) / rect.height;
            
            // Apply effect (gradient shift, shadow movement, etc.)
            el.style.setProperty('--mouse-x', xPos.toFixed(2));
            el.style.setProperty('--mouse-y', yPos.toFixed(2));
        });
        
        // Reset on mouse leave
        el.addEventListener('mouseleave', function() {
            el.style.setProperty('--mouse-x', '0.5');
            el.style.setProperty('--mouse-y', '0.5');
        });
    });

    // Custom hover animations for enhanced cards
    document.querySelectorAll('.enhanced-card').forEach(card => {
        // Add shine effect on hover
        card.addEventListener('mouseenter', function() {
            setTimeout(() => {
                card.classList.add('shine-active');
            }, 200);
        });
        
        card.addEventListener('mouseleave', function() {
            card.classList.remove('shine-active');
        });
    });

    // Function to check and apply animations to elements in viewport
    function checkAnimations() {
        animationClasses.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (isElementInViewport(element) && !element.classList.contains('is-visible')) {
                    element.classList.add('is-visible');
                    
                    // For 3D effect cards, initialize their base state
                    if (element.classList.contains('card-3d-effect')) {
                        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
                    }
                }
            });
        });

        // Update parallax effects
        updateParallax();
    }

    // Initialize challenge carousel
    initChallengeCarousel();

    // Run on scroll
    window.addEventListener('scroll', function() {
        checkAnimations();
        requestAnimationFrame(updateParallax);
    });

    // Run on resize
    window.addEventListener('resize', function() {
        checkAnimations();
    });

    // Initial check
    checkAnimations();
});

// Handle Challenge Carousel scrolling
function initChallengeCarousel() {
    const carousel = document.querySelector('.challenge-carousel');
    if (!carousel) return;

    const container = carousel.querySelector('.challenge-cards-container');
    const prevBtn = carousel.querySelector('.scroll-prev');
    const nextBtn = carousel.querySelector('.scroll-next');
    
    if (!container || !prevBtn || !nextBtn) return;
    
    // Set initial button states
    updateScrollButtons();
    
    // Scroll container when buttons are clicked
    prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -300, behavior: 'smooth' });
        updateScrollButtons();
    });
    
    nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: 300, behavior: 'smooth' });
        updateScrollButtons();
    });
    
    // Update button states when scrolling ends
    container.addEventListener('scroll', () => {
        updateScrollButtons();
    });
    
    // Function to update button states
    function updateScrollButtons() {
        // Check if we can scroll left
        prevBtn.setAttribute('aria-disabled', container.scrollLeft <= 0);
        
        // Check if we can scroll right
        const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
        nextBtn.setAttribute('aria-disabled', !canScrollRight);
    }
    
    // Touch handling for mobile swipe 
    let startX;
    let startY;
    let startScrollLeft;
    let isDown = false;
    
    container.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;
        startScrollLeft = container.scrollLeft;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        
        // Calculate horizontal movement
        const x = e.touches[0].pageX;
        const y = e.touches[0].pageY;
        
        // Only handle horizontal swipes (prevent page scrolling interference)
        const walkX = (x - startX);
        const walkY = (y - startY);
        
        if (Math.abs(walkX) > Math.abs(walkY)) {
            e.preventDefault();
            container.scrollLeft = startScrollLeft - walkX;
        }
    }, { passive: false });
    
    container.addEventListener('touchend', () => {
        isDown = false;
        updateScrollButtons();
    }, { passive: true });
}