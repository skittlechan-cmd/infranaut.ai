// Enhanced Service Carousel Script with Improved Mobile Experience
document.addEventListener("DOMContentLoaded", () => {
  initializeServiceCarousel();
  initializeScrollAnimations();
  adjustCardWidthsForMobile();

  // Re-adjust card widths when window is resized
  window.addEventListener('resize', adjustCardWidthsForMobile);
});

// Function to adjust card widths based on viewport
function adjustCardWidthsForMobile() {
  const cards = document.querySelectorAll('.service-card');
  const container = document.querySelector('.service-cards-container');
  
  if (!cards.length || !container) return;
  
  // Calculate available width
  const containerWidth = container.clientWidth;
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 640) {
    // On mobile, make cards take up most of the viewport width
    cards.forEach(card => {
      card.style.width = `${containerWidth * 0.85}px`;
      card.style.minWidth = '250px';
    });
    
    // Make scroll indicators visible on mobile
    const prevBtn = document.querySelector('.scroll-prev');
    const nextBtn = document.querySelector('.scroll-next');
    
    if (prevBtn && nextBtn) {
      // Force display scroll indicators on mobile 
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }
  } else if (viewportWidth <= 1023) {
    // On tablets, fixed width but still wider
    cards.forEach(card => {
      card.style.width = '300px';
      card.style.minWidth = '300px';
    });
  } else {
    // On desktop, use larger fixed width
    cards.forEach(card => {
      card.style.width = '320px';
      card.style.minWidth = '320px';
    });
  }
}

function initializeServiceCarousel() {
  const carousel = document.querySelector('.service-carousel');
  if (!carousel) return;

  const cardsContainer = carousel.querySelector('.service-cards-container');
  const cards = carousel.querySelectorAll('.service-card');
  const prevBtn = carousel.querySelector('.scroll-prev');
  const nextBtn = carousel.querySelector('.scroll-next');
  
  // Initialize state
  let activeCard = null;
  let isScrolling = false;
  let startX, startY;
  let scrollLeft;
  let preventClick = false;
  let touchStartTime = 0;
  
  // Set initial heights for proper animation
  cards.forEach(card => {
    const featureList = card.querySelector('.service-feature-list');
    if (featureList) {
      featureList.style.display = 'none';
      
      // Pre-calculate expanded height for smooth transitions
      if (window.innerWidth <= 640) {
        card.dataset.collapsedHeight = '235px';
        card.dataset.expandedHeight = '450px';
      } else if (window.innerWidth <= 1023) {
        card.dataset.collapsedHeight = '250px';
        card.dataset.expandedHeight = '500px';
      } else {
        card.dataset.collapsedHeight = '260px';
        card.dataset.expandedHeight = '500px';
      }
    }
  });
  
  // Handle card click/tap with improved transitions
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (preventClick) return;
      
      // Calculate the time between touchstart and click (for better mobile detection)
      const clickDuration = Date.now() - touchStartTime;
      if (clickDuration > 300) preventClick = false; // Reset if it was a long press
      
      // If we already have an active card and it's not this one, close it first
      if (activeCard && activeCard !== card) {
        closeCard(activeCard);
      }
      
      // Toggle active state on clicked card
      if (card.classList.contains('active')) {
        closeCard(card);
      } else {
        openCard(card);
      }
      
      // Ensure the card is fully visible
      if (card.classList.contains('active')) {
        setTimeout(() => {
          ensureCardVisible(card);
        }, 100);
      }
    });
  });
  
  function openCard(card) {
    card.classList.add('active');
    const featureList = card.querySelector('.service-feature-list');
    
    if (featureList) {
        // Create staggered animation for feature items
        const featureItems = featureList.querySelectorAll('.service-feature-item');
        
        // First display the container
        featureList.style.display = 'block';
        featureList.style.opacity = '0';
        
        // Add haptic feedback for mobile devices if supported
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50); // Short vibration for feedback
        }
        
        // On mobile, ensure the card has enough height to show all content
        if (window.innerWidth <= 640) {
            // Make sure the card can expand to fit content
            card.style.maxHeight = 'none';
            card.style.height = 'auto';
            card.style.overflow = 'visible';
            
            // Compute the height of all feature items to ensure they're visible
            let featureListHeight = 0;
            featureItems.forEach(item => {
                // Add each item's height plus margin
                featureListHeight += (item.offsetHeight + 12);
            });
            
            // Set minimum height to accommodate all content
            const baseHeight = 240; // Base height for title and description
            const totalHeight = baseHeight + featureListHeight + 80; // Add padding, including space for the tap to collapse text
            
            // Set explicit height to ensure all content is visible
            card.style.minHeight = `${Math.max(480, totalHeight)}px`;
            
            // Ensure feature list is displayed properly
            featureList.style.display = 'block';
            featureList.style.height = 'auto';
            featureList.style.overflow = 'visible';
            card.style.paddingBottom = '45px'; // Space for bottom tap bar
        }
        
        // Animate in with slight delay
        setTimeout(() => {
            featureList.style.opacity = '1';
            
            // Stagger each feature item with improved animation
            featureItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(15px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 60 * (index + 1));
            });
            
            // Final adjustment for mobile after all animations
            if (window.innerWidth <= 640) {
                setTimeout(() => {
                    // Ensure all content is visible after animations
                    card.style.height = 'auto';
                    card.style.overflow = 'visible';
                    
                    // Scroll to ensure the expanded card is fully visible
                    ensureCardVisible(card);
                }, 300);
            }
        }, 50);
    }
    
    activeCard = card;
  }
  
  function closeCard(card) {
    const featureList = card.querySelector('.service-feature-list');
    
    // Add haptic feedback for mobile devices if supported
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30); // Shorter vibration for closing
    }
    
    if (featureList) {
        // Fade out the feature list first
        featureList.style.opacity = '0';
        
        // Then hide it after the transition
        setTimeout(() => {
            featureList.style.display = 'none';
            card.classList.remove('active');
            
            // Reset padding and height
            card.style.paddingBottom = '';
            
            // Allow some time for the CSS transition to finish
            setTimeout(() => {
                if (!card.classList.contains('active')) {
                    card.style.maxHeight = card.dataset.collapsedHeight;
                    card.style.minHeight = '';
                }
            }, 50);
        }, 200);
    } else {
        card.classList.remove('active');
    }
    
    if (activeCard === card) {
        activeCard = null;
    }
  }
  
  // Make sure a card is fully visible when expanded
  function ensureCardVisible(card) {
    const cardRect = card.getBoundingClientRect();
    const containerRect = cardsContainer.getBoundingClientRect();
    
    // Improved scrolling to ensure card is visible
    if (cardRect.bottom > window.innerHeight) {
        // If bottom is cut off, scroll to make it visible
        const scrollAmount = Math.min(
            cardRect.bottom - window.innerHeight + 20,
            cardRect.top - 100 // Don't scroll too far up
        );
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
    
    // Horizontal scrolling if needed
    if (cardRect.right > containerRect.right) {
        const scrollAmount = cardRect.right - containerRect.right + 20;
        smoothScroll(cardsContainer, cardsContainer.scrollLeft + scrollAmount, 300);
    } else if (cardRect.left < containerRect.left) {
        const scrollAmount = cardRect.left - containerRect.left - 20;
        smoothScroll(cardsContainer, cardsContainer.scrollLeft + scrollAmount, 300);
    }
  }
  
  // Smooth scroll function
  function smoothScroll(element, to, duration) {
    const start = element.scrollLeft;
    const change = to - start;
    let currentTime = 0;
    const increment = 20;
    
    function animateScroll() {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollLeft = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    }
    
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    animateScroll();
  }
  
  // Handle scroll indicators
  function updateScrollButtons() {
    const scrollPosition = cardsContainer.scrollLeft;
    const maxScroll = cardsContainer.scrollWidth - cardsContainer.clientWidth;
    
    // On mobile always show the buttons
    if (window.innerWidth <= 640) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      // On larger screens, only show if scrollable
      const isScrollable = maxScroll > 10;
      prevBtn.style.display = isScrollable ? 'flex' : 'none';
      nextBtn.style.display = isScrollable ? 'flex' : 'none';
    }
    
    // Update button states
    prevBtn.classList.toggle('disabled', scrollPosition <= 10);
    prevBtn.style.opacity = scrollPosition <= 10 ? '0.5' : '1';
    
    nextBtn.classList.toggle('disabled', scrollPosition >= maxScroll - 10);  
    nextBtn.style.opacity = scrollPosition >= maxScroll - 10 ? '0.5' : '1';
  }
  
  // Initial update
  updateScrollButtons();
  
  // Scroll event listeners
  cardsContainer.addEventListener('scroll', () => {
    updateScrollButtons();
  });
  
  // Scroll buttons with smooth scrolling
  prevBtn.addEventListener('click', () => {
    const cardWidth = cards[0].offsetWidth;
    const gap = 12; // Reduced gap for better spacing
    smoothScroll(cardsContainer, cardsContainer.scrollLeft - (cardWidth + gap), 300);
  });
  
  nextBtn.addEventListener('click', () => {
    const cardWidth = cards[0].offsetWidth;
    const gap = 12; // Reduced gap for better spacing
    smoothScroll(cardsContainer, cardsContainer.scrollLeft + (cardWidth + gap), 300);
  });
  
  // Enhanced touch handling for mobile
  cardsContainer.addEventListener('touchstart', (e) => {
    isScrolling = false;
    preventClick = false;
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    scrollLeft = cardsContainer.scrollLeft;
    touchStartTime = Date.now();
  }, { passive: true });
  
  cardsContainer.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    const deltaX = startX - x;
    const deltaY = startY - y;
    
    // Detect horizontal scrolling with improved threshold
    if (!isScrolling && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
      isScrolling = true;
      preventClick = true;
      e.preventDefault();
    }
    
    if (isScrolling) {
      cardsContainer.scrollLeft = scrollLeft + deltaX;
    }
  }, { passive: false });
  
  cardsContainer.addEventListener('touchend', (e) => {
    // Calculate velocity for momentum scrolling
    const touchDuration = Date.now() - touchStartTime;
    
    // Only keep 'preventClick' true if it was a quick swipe
    if (touchDuration < 200 && isScrolling) {
      preventClick = true;
      setTimeout(() => {
        preventClick = false;
      }, 150);
    } else {
      preventClick = false;
    }
    
    isScrolling = false;
    updateScrollButtons();
  }, { passive: true });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    updateScrollButtons();
    
    // Update card heights on resize
    cards.forEach(card => {
      if (window.innerWidth <= 640) {
        card.dataset.collapsedHeight = '235px';
        card.dataset.expandedHeight = '450px';
      } else if (window.innerWidth <= 1023) {
        card.dataset.collapsedHeight = '250px';
        card.dataset.expandedHeight = '500px';
      } else {
        card.dataset.collapsedHeight = '260px';
        card.dataset.expandedHeight = '500px';
      }
    });
  });
}

// Add smooth scroll animations for elements with reveal-on-scroll class
function initializeScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(element => {
    observer.observe(element);
  });
}