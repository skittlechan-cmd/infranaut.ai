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
      
      // Animate in with slight delay
      setTimeout(() => {
        featureList.style.opacity = '1';
        
        // Stagger each feature item
        featureItems.forEach((item, index) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          
          setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 80 * (index + 1));
        });
      }, 50);
    }
    
    activeCard = card;
  }
  
  function closeCard(card) {
    const featureList = card.querySelector('.service-feature-list');
    
    if (featureList) {
      // Fade out the feature list first
      featureList.style.opacity = '0';
      
      // Then hide it after the transition
      setTimeout(() => {
        featureList.style.display = 'none';
        card.classList.remove('active');
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
    
    // Update button states
    prevBtn.classList.toggle('disabled', scrollPosition <= 10);
    nextBtn.classList.toggle('disabled', scrollPosition >= maxScroll - 10);
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