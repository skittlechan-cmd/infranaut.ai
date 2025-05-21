// Enhanced Service Carousel Script with Improved Mobile Experience
document.addEventListener("DOMContentLoaded", () => {
  // Make sure adjustAllCardsHeight is globally available
  window.adjustAllCardsHeight = adjustAllCardsHeight;
  
  // Check if service carousel exists before initializing
  const serviceCarousel = document.querySelector('.service-carousel');
  if (serviceCarousel) {
    initializeServiceCarousel();
    adjustCardWidthsForMobile();
    
    // Run the card height adjustment after a short delay to ensure proper rendering
    setTimeout(() => {
      adjustAllCardsHeight();
    }, 300);

    // Re-adjust card widths when window is resized
    window.addEventListener('resize', () => {
      adjustCardWidthsForMobile();
      
      // Run height adjustment after resize with a delay
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        adjustAllCardsHeight();
      }, 300);
    });
  }
  
  // Initialize scroll animations on all pages
  initializeScrollAnimations();
});

// Timer variable for resize events
let resizeTimer;

// Function to adjust card widths based on viewport
function adjustCardWidthsForMobile() {
  const cards = document.querySelectorAll('.service-card');
  const container = document.querySelector('.service-cards-container');
  
  if (!cards.length || !container) return;
  
  // Calculate available width
  const containerWidth = container.clientWidth;
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 640) {
    // On mobile, make cards take up most of the viewport width but smaller than before
    cards.forEach(card => {
      card.style.width = `${Math.min(containerWidth * 0.85, 300)}px`; // Reduced from 320px to 300px
      card.style.minWidth = '250px'; // Reduced from 280px to 250px
      card.style.margin = '4px 5px'; // Add some margin for spacing
    });
    
    // Make scroll indicators visible on mobile
    const prevBtn = document.querySelector('.scroll-prev');
    const nextBtn = document.querySelector('.scroll-next');
    
    if (prevBtn && nextBtn) {
      // Force display scroll indicators on mobile with smaller size 
      prevBtn.style.display = 'flex';
      prevBtn.style.width = '36px';
      prevBtn.style.height = '36px';
      prevBtn.style.opacity = '0.9';
      
      nextBtn.style.display = 'flex';
      nextBtn.style.width = '36px';
      nextBtn.style.height = '36px';
      nextBtn.style.opacity = '0.9';
    }
    
    // Set the container to properly center the cards
    container.style.justifyContent = 'flex-start';
    container.style.alignItems = 'stretch';
    container.style.padding = '12px 8px';
  } else if (viewportWidth <= 1023) {
    // On tablets, fixed width but still wider
    cards.forEach(card => {
      card.style.width = '280px'; // Slightly smaller
      card.style.minWidth = '280px';
      card.style.margin = '0';
    });
    
    container.style.justifyContent = 'flex-start';
    container.style.alignItems = 'stretch';
  } else {
    // On desktop, use larger fixed width
    cards.forEach(card => {
      card.style.width = '320px';
      card.style.minWidth = '320px';
      card.style.margin = '0';
    });
    
    container.style.justifyContent = 'flex-start';
    container.style.alignItems = 'stretch';
  }
  
  // Ensure all cards have the same height in any given row
  let maxHeight = 0;
  cards.forEach(card => {
    // Reset height first
    card.style.height = 'auto';
    maxHeight = Math.max(maxHeight, card.offsetHeight);
  });
  
  if (maxHeight > 0) {
    cards.forEach(card => {
      card.style.height = `${maxHeight}px`;
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
  
  // Check if Learn More link exists
  const learnMoreLink = document.querySelector('.features-learn-more');
  if (learnMoreLink) {
    // Make sure it's visible by moving any overlapping elements
    learnMoreLink.style.opacity = '1';
    learnMoreLink.style.zIndex = '10';
    learnMoreLink.style.position = 'relative';
    learnMoreLink.style.marginTop = '24px';
  }
  
  // Initialize state
  let activeCard = null;
  let isScrolling = false;
  let startX, startY;
  let scrollLeft;
  let preventClick = false;
  let touchStartTime = 0;
  
  // Add mobile optimization detection
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Use shorter, quicker animations on mobile for smoother experience
  let animationDuration = isMobileDevice ? 250 : 400; // ms - shorter for mobile
  
  // Set initial heights for proper animation
  cards.forEach(card => {
    const featureList = card.querySelector('.service-feature-list');
    if (featureList) {
      featureList.style.display = 'none';
      
      // Also ensure the card-learn-more is hidden by default
      const learnMore = card.querySelector('.card-learn-more');
      if (learnMore) {
        learnMore.style.display = 'none';
        learnMore.style.opacity = '0';
      }
      
      // Pre-calculate expanded height for smooth transitions - larger for mobile
      if (window.innerWidth <= 640) {
        card.dataset.collapsedHeight = '240px'; // Larger for mobile
        card.dataset.expandedHeight = '500px'; // Larger for mobile
      } else if (window.innerWidth <= 1023) {
        card.dataset.collapsedHeight = '240px'; // Smaller
        card.dataset.expandedHeight = '480px'; // Smaller
      } else {
        card.dataset.collapsedHeight = '260px';
        card.dataset.expandedHeight = '550px'; 
      }
    }
  });
  
  // Handle card click/tap with improved transitions
  cards.forEach(card => {
    // Add click event for the Learn More link that stops propagation
    const learnMoreLink = card.querySelector('.card-learn-more a');
    if (learnMoreLink) {
      learnMoreLink.addEventListener('click', function(e) {
        // Don't let the click affect the card expansion
        e.stopPropagation();
      });
    }
    
    // Add click event for the expand/collapse button
    const expandCollapseBtn = card.querySelector('.expand-collapse-button');
    if (expandCollapseBtn) {
      expandCollapseBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the card click event from firing
        
        // Toggle the card's active state
        if (card.classList.contains('active')) {
          closeCard(card);
        } else {
          // If we already have an active card and it's not this one, close it first
          if (activeCard && activeCard !== card) {
            closeCard(activeCard);
          }
          openCard(card);
        }
        
        // Ensure the card is fully visible
        if (card.classList.contains('active')) {
          setTimeout(() => {
            ensureCardVisible(card);
          }, 100);
        }
      });
    }
    
    card.addEventListener('click', function(e) {
      // Don't handle card clicks if we clicked on a link or the expand/collapse button
      if (e.target.tagName === 'A' || e.target.parentElement.tagName === 'A' || 
          (e.target.tagName === 'I' && e.target.parentElement.tagName === 'A') ||
          e.target.closest('.expand-collapse-button')) {
        return;
      }
      
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
    }, { passive: true });
  });
  
  function openCard(card) {
    card.classList.add('active');
    const featureList = card.querySelector('.service-feature-list');
    const description = card.querySelector('.service-description');
    
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

      const isMobile = window.innerWidth <= 640;
      const isTablet = window.innerWidth > 640 && window.innerWidth <= 1023;
      const isDesktop = window.innerWidth > 1023;
      
      // Allow description to expand
      if (description) {
        description.style.flexGrow = '0';
        description.style.webkitLineClamp = 'initial';
        description.style.overflow = 'visible';
        description.style.marginBottom = '1.5rem';
      }
      
      // Ensure the learn more link is visible and positioned properly
      const learnMore = card.querySelector('.card-learn-more');
      if (learnMore) {
        // Show the Learn More link with animation
        learnMore.style.display = 'block';
        
        // Fade it in with a slight delay
        setTimeout(() => {
          learnMore.style.opacity = '1';
          learnMore.style.marginTop = '12px';
        }, 200);
      }
      
      // Set content first, measure, then animate
      card.style.maxHeight = 'none';
      card.style.height = 'auto';
      card.style.overflow = 'visible';
      
      // Display feature list to measure its height
      featureList.style.display = 'block';
      featureList.style.height = 'auto';
      featureList.style.overflow = 'visible';
      
      // Apply spacing for the feature list - optimized for mobile
      featureList.style.marginTop = isMobile ? '0.5rem' : '0.625rem';
      featureList.style.paddingTop = isMobile ? '0.5rem' : '0.625rem';
      featureList.style.paddingBottom = isMobile ? '1.5rem' : '1.75rem'; // Reduced for mobile
      
      // Apply spacing for feature items - optimized for mobile
      featureItems.forEach((item, index) => {
        const isLastItem = index === featureItems.length - 1;
        item.style.marginBottom = isLastItem ? '0.75rem' : '0.5rem';
        item.style.gap = '8px';
        item.style.padding = '0.125rem 0';
        
        // Pre-set transform for better performance
        item.style.opacity = '0';
        item.style.transform = isMobileDevice ? 'translateY(6px)' : 'translateY(8px)'; // Smaller for mobile
      });
      
      // Wait a tiny bit for the DOM to update
      setTimeout(() => {
        // Calculate height based on actual content
        const footerHeight = 40; // Height of the tap to collapse button area
        
        // Set card height to fit content exactly + footer padding
        card.style.paddingBottom = `${footerHeight}px`;
        
        // Remove any min-height constraints to let content determine size
        card.style.minHeight = 'auto';
        
        // Animate in with slight delay
        featureList.style.opacity = '1';
        
        // Stagger each feature item with improved animation - optimized for mobile
        featureItems.forEach((item, index) => {
          // Animate them in with staggered delay - more efficient on mobile
          setTimeout(() => {
            // Use shorter, more efficient transitions on mobile
            if (isMobileDevice) {
              item.style.transition = 'all 0.25s ease-out';
            } else {
              item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
            }
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, isMobileDevice ? (40 * (index + 1)) : (50 * (index + 1))); // Faster on mobile
        });
        
        // Ensure expanded card is fully visible with optimized scrolling
        const scrollDelay = isMobileDevice ? 
          (Math.min(featureItems.length * 40, 200) + 50) : // Cap at 200ms on mobile
          (featureItems.length * 50 + 100);
          
        setTimeout(() => {
          ensureCardVisible(card);
        }, scrollDelay);
      }, 50);
    }
    
    activeCard = card;
  }
  
  function closeCard(card) {
    const featureList = card.querySelector('.service-feature-list');
    const description = card.querySelector('.service-description');
    
    // Store current scroll position
    const currentScrollPosition = window.scrollY;
    const currentScrollX = cardsContainer.scrollLeft;
    
    // Add haptic feedback for mobile devices if supported
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30); // Shorter vibration for closing
    }
    
    if (featureList) {
      // Fade out the feature list first
      featureList.style.opacity = '0';
      
      // Reset description to truncated state
      if (description) {
        // Different flex-grow values for desktop and mobile
        description.style.flexGrow = window.innerWidth <= 640 ? '0.5' : '0.6';
        description.style.webkitLineClamp = '3';
        description.style.overflow = 'hidden';
        description.style.marginBottom = window.innerWidth <= 640 ? '0.875rem' : '1rem';
      }
      
      // Get the learn more link
      const learnMore = card.querySelector('.card-learn-more');
      if (learnMore) {
        // Fade out the Learn More link
        learnMore.style.opacity = '0';
        
        // After fade out, hide it completely
        setTimeout(() => {
          learnMore.style.display = 'none';
        }, 200);
      }
      
      // Then hide feature list after the transition
      setTimeout(() => {
        featureList.style.display = 'none';
        card.classList.remove('active');
        
        // Reset padding and height
        card.style.paddingBottom = '';
        
        // Apply standard styling to ensure uniformity with other cards
        ensureCardStandardLayout(card);
        
        // Allow some time for the CSS transition to finish
        setTimeout(() => {
          if (!card.classList.contains('active')) {
            // Reset to original height based on device
            const isMobile = window.innerWidth <= 640;
            const height = isMobile ? '240px' : (window.innerWidth <= 1023 ? '240px' : '260px');
            
            card.style.maxHeight = height;
            card.style.minHeight = height;
            card.style.height = height;
            card.style.overflow = 'hidden';
            
            // Ensure consistent layout among all cards
            adjustAllCardsHeight();
            
            // Restore scroll position to maintain the same view
            window.scrollTo(0, currentScrollPosition);
            cardsContainer.scrollLeft = currentScrollX;
          }
        }, 50);
      }, 200);
    } else {
      card.classList.remove('active');
      ensureCardStandardLayout(card);
    }
    
    if (activeCard === card) {
      activeCard = null;
    }
  }
  
  // New function to ensure consistent card layout
  function ensureCardStandardLayout(card) {
    // Reset all custom inline styles that might affect layout
    card.style.transform = '';
    
    const content = card.querySelector('.service-card-content');
    if (content) {
      content.style.flexGrow = '1';
    }
    
    const title = card.querySelector('.service-title');
    if (title) {
      title.style.marginBottom = '';
    }
    
    const description = card.querySelector('.service-description');
    if (description) {
      description.style.marginBottom = '';
      description.style.webkitLineClamp = '3';
      description.style.overflow = 'hidden';
      description.style.display = '-webkit-box';
      description.style.webkitBoxOrient = 'vertical';
    }
    
    // Hide Learn More link when card is collapsed
    const learnMore = card.querySelector('.card-learn-more');
    if (learnMore) {
      learnMore.style.display = 'none';
      learnMore.style.opacity = '0';
    }
    
    // Ensure all cards in a row are the same height
    adjustAllCardsHeight();
  }
  
  // Ensure all cards have the same height
  function adjustAllCardsHeight() {
    // Get the cards container first
    const cardsContainer = document.querySelector('.service-cards-container');
    if (!cardsContainer) return; // Exit if no container exists
    
    const cards = cardsContainer.querySelectorAll('.service-card');
    if (!cards.length) return; // Exit if no cards exist
    
    // Check if we're currently scrolling
    const isScrolling = cardsContainer.dataset.isScrolling === 'true';
    if (isScrolling) return;
    
    // Only run if not currently scrolling
    if (isScrolling) return;
    
    const visibleCards = Array.from(cards).filter(card => {
      const rect = card.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= window.innerWidth;
    });
    
    if (visibleCards.length === 0) return;
    
    let maxHeight = 0;
    visibleCards.forEach(card => {
      // Temporarily reset height for measurement
      const originalHeight = card.style.height;
      card.style.height = 'auto';
      
      // Get natural height
      const naturalHeight = card.offsetHeight;
      maxHeight = Math.max(maxHeight, naturalHeight);
      
      // Restore original height
      card.style.height = originalHeight;
    });
    
    // Apply uniform height to all visible cards
    if (maxHeight > 0) {
      const standardHeight = window.innerWidth <= 640 ? '240px' : (window.innerWidth <= 1023 ? '240px' : '260px');
      const finalHeight = Math.max(parseInt(standardHeight), maxHeight);
      
      visibleCards.forEach(card => {
        // Don't change height of active cards
        if (!card.classList.contains('active')) {
          card.style.height = `${finalHeight}px`;
        }
      });
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
        cardRect.bottom - window.innerHeight + 30,
        cardRect.top - 100 // Don't scroll too far up
      );
      
      // Use smoother scrolling for vertical scroll
      window.scrollTo({
        top: window.scrollY + scrollAmount,
        behavior: 'smooth',
        // Use custom easing function for smoother scrolling
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
      });
    }
    
    // Horizontal scrolling if needed
    if (cardRect.right > containerRect.right) {
      const scrollAmount = cardRect.right - containerRect.right + 30;
      smoothScroll(cardsContainer, cardsContainer.scrollLeft + scrollAmount, 400); // Longer duration for smoother animation
    } else if (cardRect.left < containerRect.left) {
      const scrollAmount = cardRect.left - containerRect.left - 30;
      smoothScroll(cardsContainer, cardsContainer.scrollLeft + scrollAmount, 400); // Longer duration for smoother animation
    }
  }
  
  // Improved smooth scroll function with better easing and shorter duration
  function smoothScroll(element, to, duration) {
    // Use shorter duration for mobile devices
    const actualDuration = isMobileDevice ? Math.min(duration, 250) : duration;
    
    const start = element.scrollLeft;
    const change = to - start;
    let currentTime = 0;
    const increment = 10; // Higher fps for smoother animation
    
    function animateScroll() {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, start, change, actualDuration);
      element.scrollLeft = val;
      if (currentTime < actualDuration) {
        requestAnimationFrame(animateScroll);
      }
    }
    
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animateScroll);
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
    
    // Update button states with smoother transitions
    prevBtn.classList.toggle('disabled', scrollPosition <= 10);
    prevBtn.style.opacity = scrollPosition <= 10 ? '0.5' : '1';
    prevBtn.style.transition = 'opacity 0.3s ease';
    
    nextBtn.classList.toggle('disabled', scrollPosition >= maxScroll - 10);  
    nextBtn.style.opacity = scrollPosition >= maxScroll - 10 ? '0.5' : '1';
    nextBtn.style.transition = 'opacity 0.3s ease';
  }
  
  // Initial update
  updateScrollButtons();
  
  // Scroll event listeners
  cardsContainer.addEventListener('scroll', () => {
    updateScrollButtons();
  });
  
  // Scroll buttons with improved smooth scrolling
  prevBtn.addEventListener('click', () => {
    const cardWidth = cards[0].offsetWidth;
    const gap = 12; // Reduced gap for better spacing
    smoothScroll(cardsContainer, cardsContainer.scrollLeft - (cardWidth + gap), 400); // Longer duration for smoother animation
  });
  
  nextBtn.addEventListener('click', () => {
    const cardWidth = cards[0].offsetWidth;
    const gap = 12; // Reduced gap for better spacing
    smoothScroll(cardsContainer, cardsContainer.scrollLeft + (cardWidth + gap), 400); // Longer duration for smoother animation
  });
  
  // Enhanced touch handling for mobile with improved efficiency
  cardsContainer.addEventListener('touchstart', (e) => {
    isScrolling = false;
    preventClick = false;
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    scrollLeft = cardsContainer.scrollLeft;
    touchStartTime = Date.now();
    
    // Cancel any ongoing momentum scrolling
    cardsContainer.style.scrollBehavior = 'auto';
  }, { passive: true });
  
  cardsContainer.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    const deltaX = startX - x;
    const deltaY = startY - y;
    
    // Fix: Only interfere with page scrolling if clearly a horizontal swipe
    if (!isScrolling) {
      // Only handle as horizontal swipe if movement is primarily horizontal
      // and after a minimum threshold to avoid interfering with page scrolling
      if (Math.abs(deltaX) > Math.abs(deltaY) * 2 && Math.abs(deltaX) > 15) {
        isScrolling = true;
        preventClick = true;
        
        // Prevent default to handle the horizontal scroll ourselves
        e.preventDefault();
      }
    }
    
    if (isScrolling) {
      cardsContainer.scrollLeft = scrollLeft + deltaX;
    }
  }, { passive: false });
  
  cardsContainer.addEventListener('touchend', (e) => {
    // Only apply momentum if we were actually horizontally scrolling
    if (isScrolling) {
      // Calculate momentum scrolling
      const touchDuration = Date.now() - touchStartTime;
      const touchDistance = cardsContainer.scrollLeft - scrollLeft;
      
      // Apply momentum scrolling for short, fast swipes
      if (touchDuration < 200 && Math.abs(touchDistance) > 40) {
        // Calculate velocity and apply momentum
        const velocity = touchDistance / touchDuration;
        const momentum = velocity * 100; // Adjust momentum factor
        
        // Apply smooth scrolling with momentum
        cardsContainer.style.scrollBehavior = 'smooth';
        cardsContainer.scrollLeft += momentum;
      }
    }
    
    preventClick = isScrolling && (Date.now() - touchStartTime < 300);
    setTimeout(() => {
      preventClick = false;
      // Reset scroll behavior after momentum scrolling
      cardsContainer.style.scrollBehavior = 'auto';
    }, 300);
    
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
        card.dataset.expandedHeight = '480px'; // Increased for better mobile view
      } else if (window.innerWidth <= 1023) {
        card.dataset.collapsedHeight = '250px';
        card.dataset.expandedHeight = '500px';
      } else {
        card.dataset.collapsedHeight = '260px';
        card.dataset.expandedHeight = '550px'; // Increased for desktop view
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