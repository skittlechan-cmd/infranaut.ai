// Enhanced Service Carousel Script
document.addEventListener("DOMContentLoaded", () => {
  initializeServiceCarousel();
});

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
  let startX;
  let scrollLeft;
  
  // Initial setup
  updateScrollButtons();
  setupResizeHandler();
  
  // Setup event listeners for cards
  cards.forEach(card => {
    setupCardInteraction(card);
  });
  
  // Setup scroll functionality
  setupScrolling();
  
  // Setup navigation buttons
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', scrollToPrev);
    nextBtn.addEventListener('click', scrollToNext);
  }
  
  // Card interaction setup
  function setupCardInteraction(card) {
    card.addEventListener('click', (e) => {
      // Don't handle clicks on links or buttons
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      
      const wasActive = card === activeCard;
      
      // Check if clicking near the bottom (collapse area)
      const cardRect = card.getBoundingClientRect();
      const clickedCollapseArea = wasActive && (e.clientY > (cardRect.bottom - 60));
      
      // Close any previously opened card
      if (activeCard && activeCard !== card) {
        collapseCard(activeCard);
      }
      
      // Toggle current card
      if (!wasActive) {
        expandCard(card);
      } else if (clickedCollapseArea) {
        collapseCard(card);
      }
      
      // Ensure expanded card is visible
      if (!wasActive && isCardPartiallyOffscreen(card)) {
        smoothScrollCardIntoView(card);
      }
    });
  }
  
  // Expand card with animation
  function expandCard(card) {
    // Update active card reference
    activeCard = card;
    
    // Add active class
    card.classList.add('active');
    
    // Get feature list and animate it
    const featureList = card.querySelector('.service-feature-list');
    const featureItems = featureList.querySelectorAll('.service-feature-item');
    
    // Reset animations
    featureList.style.maxHeight = '0px';
    featureList.style.opacity = '0';
    featureList.style.transform = 'translateY(20px)';
    
    // Measure the full height to animate to (add extra padding for the collapse button)
    const fullHeight = featureList.scrollHeight + 40;
    
    // Force reflow
    featureList.offsetHeight;
    
    // Animate to full height
    requestAnimationFrame(() => {
      featureList.style.maxHeight = fullHeight + 'px';
      featureList.style.opacity = '1';
      featureList.style.transform = 'translateY(0)';
      
      // Animate feature items with staggered delay
      featureItems.forEach((item, index) => {
        item.style.transitionDelay = `${0.1 + (index * 0.1)}s`;
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    });
    
    // Wait for initial animation to complete before showing the "tap to collapse" text clearly
    setTimeout(() => {
      card.classList.add('fully-expanded');
    }, 300);
  }
  
  // Collapse card with animation
  function collapseCard(card) {
    // Remove fully expanded class immediately for better transition
    card.classList.remove('fully-expanded');
    
    const featureList = card.querySelector('.service-feature-list');
    const featureItems = featureList.querySelectorAll('.service-feature-item');
    
    // Reset feature items
    featureItems.forEach(item => {
      item.style.transitionDelay = '0s';
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
    });
    
    // Collapse the list
    featureList.style.maxHeight = '0px';
    featureList.style.opacity = '0';
    featureList.style.transform = 'translateY(20px)';
    
    // Remove active class after animation
    setTimeout(() => {
      card.classList.remove('active');
      if (activeCard === card) {
        activeCard = null;
      }
    }, 300);
  }
  
  // Setup scrolling functionality
  function setupScrolling() {
    // Touch events for mobile
    cardsContainer.addEventListener('touchstart', handleScrollStart, { passive: false });
    cardsContainer.addEventListener('touchmove', handleScroll, { passive: false });
    cardsContainer.addEventListener('touchend', handleScrollEnd);
    
    // Mouse events for desktop
    cardsContainer.addEventListener('mousedown', handleScrollStart);
    cardsContainer.addEventListener('mousemove', handleScroll);
    cardsContainer.addEventListener('mouseup', handleScrollEnd);
    cardsContainer.addEventListener('mouseleave', handleScrollEnd);
    
    // Prevent click during scroll
    cardsContainer.addEventListener('click', preventClickDuringScroll, true);
    
    // Update buttons on scroll
    cardsContainer.addEventListener('scroll', updateScrollButtons);
  }
  
  function handleScrollStart(e) {
    isScrolling = true;
    startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    scrollLeft = cardsContainer.scrollLeft;
    
    cardsContainer.style.scrollBehavior = 'auto';
    cardsContainer.classList.add('scrolling');
    
    // Prevent default only for mouse events to avoid page scrolling issues
    if (e.type.includes('mouse')) {
      e.preventDefault();
    }
  }
  
  function handleScroll(e) {
    if (!isScrolling) return;
    
    const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    const distance = (startX - x) * 1.5;
    
    cardsContainer.scrollLeft = scrollLeft + distance;
    updateScrollButtons();
    
    // Add data attribute to track scrolling
    cardsContainer.dataset.scrolling = 'true';
    
    // Prevent default to stop page scrolling while swiping cards
    e.preventDefault();
  }
  
  function handleScrollEnd() {
    if (!isScrolling) return;
    
    isScrolling = false;
    cardsContainer.classList.remove('scrolling');
    cardsContainer.style.scrollBehavior = 'smooth';
    
    // Keep track of scrolling for a short period to prevent clicks
    setTimeout(() => {
      delete cardsContainer.dataset.scrolling;
    }, 100);
    
    updateScrollButtons();
  }
  
  function preventClickDuringScroll(e) {
    if (cardsContainer.dataset.scrolling) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  
  // Navigation button functions
  function updateScrollButtons() {
    if (!prevBtn || !nextBtn) return;
    
    const scrollLeft = cardsContainer.scrollLeft;
    const maxScroll = cardsContainer.scrollWidth - cardsContainer.clientWidth;
    
    // Add/remove disabled class and visual indicator
    prevBtn.classList.toggle('disabled', scrollLeft <= 8); // Small buffer for rounding errors
    nextBtn.classList.toggle('disabled', scrollLeft >= maxScroll - 8);
    
    // Update ARIA attributes
    prevBtn.setAttribute('aria-disabled', scrollLeft <= 8);
    nextBtn.setAttribute('aria-disabled', scrollLeft >= maxScroll - 8);
  }
  
  function scrollToNext() {
    const cardWidth = cards[0].offsetWidth + parseInt(window.getComputedStyle(cards[0]).marginRight);
    const scrollAmount = Math.min(cardWidth, cardsContainer.clientWidth / 2);
    
    cardsContainer.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
  
  function scrollToPrev() {
    const cardWidth = cards[0].offsetWidth + parseInt(window.getComputedStyle(cards[0]).marginRight);
    const scrollAmount = Math.min(cardWidth, cardsContainer.clientWidth / 2);
    
    cardsContainer.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }
  
  // Utility functions
  function isCardPartiallyOffscreen(card) {
    const cardRect = card.getBoundingClientRect();
    const containerRect = cardsContainer.getBoundingClientRect();
    
    return (cardRect.right > containerRect.right || cardRect.left < containerRect.left);
  }
  
  function smoothScrollCardIntoView(card) {
    const cardRect = card.getBoundingClientRect();
    const containerRect = cardsContainer.getBoundingClientRect();
    
    if (cardRect.right > containerRect.right) {
      // Card is off to the right
      cardsContainer.scrollBy({
        left: cardRect.right - containerRect.right + 24, // Add padding
        behavior: 'smooth'
      });
    } else if (cardRect.left < containerRect.left) {
      // Card is off to the left
      cardsContainer.scrollBy({
        left: cardRect.left - containerRect.left - 24, // Subtract padding
        behavior: 'smooth'
      });
    }
  }
  
  // Handle window resize
  function setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateScrollButtons();
        
        // Recalculate active card's feature list height if needed
        if (activeCard) {
          const featureList = activeCard.querySelector('.service-feature-list');
          featureList.style.maxHeight = featureList.scrollHeight + 'px';
        }
      }, 100);
    });
  }
}