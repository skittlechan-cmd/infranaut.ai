document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', function() {
        const elements = document.querySelectorAll('.fade-in, .slide-in-up');
        elements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            }
        });
    });

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    // Initial check for elements in viewport
    const elements = document.querySelectorAll('.fade-in, .slide-in-up');
    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('visible');
        }
    });

    // Reveal animations when elements enter viewport
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealOnScrollHandler = function() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animated');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScrollHandler);
    revealOnScrollHandler(); // Trigger on initial load
    
    // Service Card Interactions
    const serviceCards = document.querySelectorAll('.service-card');
    
    // On mobile, add a pulsing effect to highlight cards are interactive
    if (window.innerWidth <= 768) {
        serviceCards.forEach(card => {
            // Add a subtle animation to highlight cards are interactive
            card.classList.add('mobile-card-highlight');
            
            // Better tap handling for mobile
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, {passive: true});
            
            card.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, {passive: true});
        });
        
        // Show a tooltip indicating cards are expandable on first visit
        const cardContainer = document.querySelector('.service-cards-container');
        if (cardContainer && !localStorage.getItem('cardTipShown')) {
            const tooltip = document.createElement('div');
            tooltip.className = 'mobile-card-tooltip';
            tooltip.innerHTML = '<span>Swipe to see more and tap any card to expand</span>';
            cardContainer.parentNode.insertBefore(tooltip, cardContainer);
            
            // Remove tooltip after 5 seconds or when a card is tapped
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.classList.add('fade-out');
                    setTimeout(() => tooltip.remove(), 500);
                }
            }, 5000);
            
            serviceCards.forEach(card => {
                card.addEventListener('click', () => {
                    if (tooltip.parentNode) {
                        tooltip.classList.add('fade-out');
                        setTimeout(() => tooltip.remove(), 500);
                    }
                    localStorage.setItem('cardTipShown', 'true');
                }, {once: true});
            });
        }
    }
    
    // Toggle card expanded state
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // First close any open cards
            if (!this.classList.contains('active')) {
                serviceCards.forEach(openCard => {
                    if (openCard !== this && openCard.classList.contains('active')) {
                        openCard.classList.remove('active');
                    }
                });
            }
            
            // Toggle this card
            this.classList.toggle('active');
        });
    });
    
    // Horizontal scrolling for service cards on mobile
    const serviceCardContainer = document.querySelector('.service-cards-container');
    const prevButton = document.querySelector('.scroll-prev');
    const nextButton = document.querySelector('.scroll-next');
    
    if (serviceCardContainer && prevButton && nextButton) {
        // Calculate the width to scroll (card width + gap)
        const cardWidth = serviceCards.length > 0 ? serviceCards[0].offsetWidth + 16 : 286;
        
        // Update scroll buttons state
        const updateScrollButtonsState = () => {
            const scrollLeft = serviceCardContainer.scrollLeft;
            const maxScrollLeft = serviceCardContainer.scrollWidth - serviceCardContainer.clientWidth;
            
            prevButton.classList.toggle('disabled', scrollLeft <= 0);
            nextButton.classList.toggle('disabled', scrollLeft >= maxScrollLeft - 5);
            
            prevButton.setAttribute('aria-disabled', scrollLeft <= 0);
            nextButton.setAttribute('aria-disabled', scrollLeft >= maxScrollLeft - 5);
        };
        
        // Scroll to previous card
        prevButton.addEventListener('click', () => {
            serviceCardContainer.scrollBy({
                left: -cardWidth,
                behavior: 'smooth'
            });
        });
        
        // Scroll to next card
        nextButton.addEventListener('click', () => {
            serviceCardContainer.scrollBy({
                left: cardWidth,
                behavior: 'smooth'
            });
        });
        
        // Update button states on scroll
        serviceCardContainer.addEventListener('scroll', updateScrollButtonsState);
        
        // Initialize button states
        updateScrollButtonsState();
        
        // Add scroll indicator to show there's more content
        if (window.innerWidth <= 768 && serviceCardContainer.scrollWidth > serviceCardContainer.clientWidth) {
            serviceCardContainer.classList.add('has-more-content');
        }
    }
});