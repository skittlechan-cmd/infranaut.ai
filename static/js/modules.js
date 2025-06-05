// Enhanced Service Carousel Script with Improved Mobile Experience

function adjustAllCardsHeight() {
  // Get the cards container first
  const cardsContainer = document.querySelector('.service-cards-container');
  if (!cardsContainer) return;

  const cards = cardsContainer.querySelectorAll('.service-card');
  if (!cards.length) return;

  // Check if we're currently scrolling
  const isScrolling = cardsContainer.dataset.isScrolling === 'true';
  if (isScrolling) return;
  
  // Get visible cards
  const visibleCards = Array.from(cards).filter(card => {
    const rect = card.getBoundingClientRect();
    return rect.left < window.innerWidth && rect.right > 0;
  });

  if (visibleCards.length === 0) return;

  let maxHeight = 0;
  visibleCards.forEach(card => {
    // Reset height first
    card.style.height = 'auto';
    const height = card.offsetHeight;
    maxHeight = Math.max(maxHeight, height);
  });

  // Apply uniform height to all visible cards
  if (maxHeight > 0) {
    visibleCards.forEach(card => {
      // Only apply to non-active cards
      if (!card.classList.contains('active')) {
        card.style.height = `${maxHeight}px`;
      }
    });
  }
}

let resizeTimer;

document.addEventListener("DOMContentLoaded", () => {
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

function adjustCardWidthsForMobile() {
  const cards = document.querySelectorAll('.service-card');
  const container = document.querySelector('.service-cards-container');
  
  if (!cards.length || !container) return;
  
  // Calculate available width
  const containerWidth = container.clientWidth;
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 640) {
    cards.forEach(card => {
      card.style.width = `${Math.min(containerWidth * 0.85, 300)}px`;
      card.style.minWidth = '250px';
      card.style.margin = '4px 5px';
    });
    
    const prevBtn = document.querySelector('.scroll-prev');
    const nextBtn = document.querySelector('.scroll-next');
    
    if (prevBtn && nextBtn) {
      prevBtn.style.display = 'flex';
      prevBtn.style.width = '36px';
      prevBtn.style.height = '36px';
      prevBtn.style.opacity = '0.9';
      
      nextBtn.style.display = 'flex';
      nextBtn.style.width = '36px';
      nextBtn.style.height = '36px';
      nextBtn.style.opacity = '0.9';
    }
    
    container.style.justifyContent = 'flex-start';
    container.style.alignItems = 'stretch';
    container.style.padding = '12px 8px';
  } else if (viewportWidth <= 1023) {
    cards.forEach(card => {
      card.style.width = '280px';
      card.style.minWidth = '280px';
      card.style.margin = '0';
    });
  } else {
    cards.forEach(card => {
      card.style.width = '320px';
      card.style.minWidth = '320px';
      card.style.margin = '0';
    });
  }
  
  let maxHeight = 0;
  cards.forEach(card => {
    card.style.height = 'auto';
    maxHeight = Math.max(maxHeight, card.offsetHeight);
  });
  
  if (maxHeight > 0) {
    cards.forEach(card => {
      if (!card.classList.contains('active')) {
        card.style.height = `${maxHeight}px`;
      }
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
    learnMoreLink.style.opacity = '1';
    learnMoreLink.style.zIndex = '10';
    learnMoreLink.style.position = 'relative';
    learnMoreLink.style.marginTop = '24px';
  }
  
  let activeCard = null;
  let isScrolling = false;
  let startX, startY;
  let scrollLeft;
  let preventClick = false;
  let touchStartTime = 0;
  
  const isMobileDevice = /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const animationDuration = isMobileDevice ? 250 : 400;
  
  cards.forEach(card => {
    const featureList = card.querySelector('.service-feature-list');
    if (featureList) {
      featureList.style.display = 'none';
      
      const learnMore = card.querySelector('.card-learn-more');
      if (learnMore) {
        learnMore.style.display = 'none';
        learnMore.style.opacity = '0';
      }
      
      if (window.innerWidth <= 640) {
        card.dataset.collapsedHeight = '240px';
        card.dataset.expandedHeight = '500px';
      } else if (window.innerWidth <= 1023) {
        card.dataset.collapsedHeight = '240px';
        card.dataset.expandedHeight = '480px';
      } else {
        card.dataset.collapsedHeight = '260px';
        card.dataset.expandedHeight = '550px';
      }
    }
  });
  
  cards.forEach(card => {
    // Add click handler for the expand/collapse button
    const expandButton = card.querySelector('.expand-collapse-button');
    if (expandButton) {
      expandButton.addEventListener('click', async function(e) {
        e.stopPropagation(); // Prevent card click event
        
        if (preventClick) return;
        
        if (card.classList.contains('active')) {
          await closeCard(card);
        } else {
          await openCard(card);
        }
        
        if (card.classList.contains('active')) {
          setTimeout(() => {
            ensureCardVisible(card);
          }, 100);
        }
      });
    }

    // Card click handler
    card.addEventListener('click', async function(e) {
      // Only handle clicks outside of links and the expand button
      if (e.target.closest('a') || e.target === expandButton || e.target.closest('.expand-collapse-button')) {
        return;
      }
      
      if (preventClick) return;
      
      const clickDuration = Date.now() - touchStartTime;
      if (clickDuration > 300) preventClick = false;
      
      if (card.classList.contains('active')) {
        await closeCard(card);
      } else {
        await openCard(card);
      }
      
      if (card.classList.contains('active')) {
        setTimeout(() => {
          ensureCardVisible(card);
        }, 100);
      }
    }, { passive: true });
  });
  
  async function openCard(card) {
    // If there's an active card and it's not this one, close it first
    if (activeCard && activeCard !== card) {
      await closeCard(activeCard, true); // Wait for the close animation to complete
    }

    // Ensure we recalculate heights before opening
    adjustAllCardsHeight();
    
    card.classList.add('active');
    const featureList = card.querySelector('.service-feature-list');
    const description = card.querySelector('.service-description');
    const learnMore = card.querySelector('.card-learn-more');
    
    // Set transition before changing height
    card.style.transition = `height ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    // Force a reflow before changing height
    void card.offsetHeight;
    card.style.height = card.dataset.expandedHeight;
    
    if (featureList) {
      // Set initial state
      featureList.style.display = 'block';
      featureList.style.opacity = '0';
      featureList.style.transition = 'opacity 0.3s ease';
      
      // Force a reflow
      void featureList.offsetHeight;
      
      // Animate in
      featureList.style.opacity = '1';
      
      if (learnMore) {
        learnMore.style.display = 'block';
        learnMore.style.opacity = '0';
        learnMore.style.transition = 'opacity 0.3s ease';
        
        // Slight delay for learn more button
        setTimeout(() => {
          learnMore.style.opacity = '1';
        }, 100);
      }
      
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
    
    if (description) {
      description.style.transition = 'all 0.3s ease';
      description.style.opacity = '1';
      description.style.webkitLineClamp = 'unset';
      description.style.overflow = 'visible';
    }
    
    activeCard = card;
  }
  
  function closeCard(card, isSwitch = false) {
    return new Promise((resolve) => {
      const featureList = card.querySelector('.service-feature-list');
      const description = card.querySelector('.service-description');
      const learnMore = card.querySelector('.card-learn-more');
      
      // Immediately start hiding content
      if (learnMore) {
        learnMore.style.transition = 'opacity 0.2s ease';
        learnMore.style.opacity = '0';
      }
      
      if (description) {
        description.style.transition = 'all 0.2s ease';
        description.style.webkitLineClamp = '3';
        description.style.overflow = 'hidden';
        description.style.display = '-webkit-box';
        description.style.webkitBoxOrient = 'vertical';
      }
      
      if (featureList) {
        featureList.style.transition = 'opacity 0.2s ease';
        featureList.style.opacity = '0';
      }

      // Start height transition immediately
      card.style.transition = `height ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      card.style.height = card.dataset.collapsedHeight;
      
      // Hide content after a short delay to ensure smooth transition
      setTimeout(() => {
        if (featureList) featureList.style.display = 'none';
        if (learnMore) learnMore.style.display = 'none';
        card.classList.remove('active');
        
        // After the height transition completes
        setTimeout(() => {
          if (!card.classList.contains('active')) {
            card.style.transition = '';
            if (description) description.style.transition = '';
            if (!isSwitch) {
              adjustAllCardsHeight();
            }
          }
          resolve();
        }, animationDuration);
        
      }, 50);
      
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30);
      }
      
      if (activeCard === card) {
        activeCard = null;
      }
    });
  }
  
  function ensureCardVisible(card) {
    const cardRect = card.getBoundingClientRect();
    const containerRect = cardsContainer.getBoundingClientRect();
    
    if (cardRect.bottom > window.innerHeight) {
      const scrollAmount = Math.min(
        cardRect.bottom - window.innerHeight + 30,
        cardRect.top - 100
      );
      
      window.scrollTo({
        top: window.scrollY + scrollAmount,
        behavior: 'smooth'
      });
    }
    
    if (cardRect.right > containerRect.right) {
      const scrollAmount = cardRect.right - containerRect.right + 30;
      smoothScroll(cardsContainer, cardsContainer.scrollLeft + scrollAmount, animationDuration);
    } else if (cardRect.left < containerRect.left) {
      const scrollAmount = cardRect.left - containerRect.left - 30;
      smoothScroll(cardsContainer, cardsContainer.scrollLeft + scrollAmount, animationDuration);
    }
  }
  
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
  
  function updateScrollButtons() {
    const scrollPosition = cardsContainer.scrollLeft;
    const maxScroll = cardsContainer.scrollWidth - cardsContainer.clientWidth;
    
    if (window.innerWidth <= 640) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      const isScrollable = maxScroll > 10;
      prevBtn.style.display = isScrollable ? 'flex' : 'none';
      nextBtn.style.display = isScrollable ? 'flex' : 'none';
    }
    
    prevBtn.classList.toggle('disabled', scrollPosition <= 10);
    nextBtn.classList.toggle('disabled', scrollPosition >= maxScroll - 10);
  }
  
  updateScrollButtons();
  
  cardsContainer.addEventListener('scroll', updateScrollButtons);
  
  prevBtn.addEventListener('click', () => {
    const cardWidth = cards[0].offsetWidth + 12;
    smoothScroll(cardsContainer, cardsContainer.scrollLeft - cardWidth, animationDuration);
  });
  
  nextBtn.addEventListener('click', () => {
    const cardWidth = cards[0].offsetWidth + 12;
    smoothScroll(cardsContainer, cardsContainer.scrollLeft + cardWidth, animationDuration);
  });
  
  cardsContainer.addEventListener('touchstart', (e) => {
    isScrolling = false;
    preventClick = false;
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    scrollLeft = cardsContainer.scrollLeft;
    touchStartTime = Date.now();
  }, { passive: true });
  
  cardsContainer.addEventListener('touchmove', (e) => {
    if (!isScrolling) {
      const deltaX = startX - e.touches[0].pageX;
      const deltaY = startY - e.touches[0].pageY;
      
      // Determine if it's primarily a horizontal scroll
      if (Math.abs(deltaX) > Math.abs(deltaY) * 2 && Math.abs(deltaX) > 15) {
        isScrolling = true;
        preventClick = true;
        // Removed e.preventDefault() here to allow native scrolling
      } else if (Math.abs(deltaY) > Math.abs(deltaX) * 2 && Math.abs(deltaY) > 15) {
         // It's primarily a vertical scroll, do not prevent default
         isScrolling = false; // Ensure isScrolling is false for vertical scrolls
         preventClick = false; // Allow clicks if it was a vertical scroll attempt
      }
    }
    
    // If it was detected as a horizontal scroll start, the browser will handle the scroll natively
    // If it was a vertical scroll start, the browser will handle the vertical scroll natively
    // The `passive: false` on this listener is still necessary to allow `preventDefault`
    // in cases where we might want to block scrolling (e.g., a complex drag interaction not present here),
    // but we are no longer calling it for the horizontal scroll gesture itself.
    // The preventDefault call is only implicitly needed if we were to re-add custom horizontal scrolling logic here.
    // By removing it, we delegate horizontal scrolling to the browser.

  }, { passive: false }); // Keep passive: false to be able to potentially call preventDefault for other gestures if needed in the future, though not for horizontal scroll here.
  
  cardsContainer.addEventListener('touchend', () => {
    isScrolling = false;
    setTimeout(() => {
      preventClick = false;
    }, 300);
    updateScrollButtons();
  }, { passive: true });
  
  cardsContainer.addEventListener('resize', () => { // Use resize event listener on the container
    updateScrollButtons();
    cards.forEach(card => {
      if (window.innerWidth <= 640) {
        card.dataset.collapsedHeight = '240px';
        card.dataset.expandedHeight = '500px';
      } else if (window.innerWidth <= 1023) {
        card.dataset.collapsedHeight = '240px';
        card.dataset.expandedHeight = '480px';
      } else {
        card.dataset.collapsedHeight = '260px';
        card.dataset.expandedHeight = '550px';
      }
    });
  });
}

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
