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