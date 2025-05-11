// Enhanced Testimonial Carousel with Improved Mobile Support
document.addEventListener('DOMContentLoaded', function() {
  // Get the testimonial elements
  const track = document.getElementById('testimonial-track');
  if (!track) {
    console.error('Testimonial track not found');
    return;
  }
  
  const cards = track.querySelectorAll('.testimonial-card');
  if (cards.length === 0) {
    console.error('No testimonial cards found');
    return;
  }
  
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dotsContainer = document.getElementById('pagination-dots');
  
  let currentIndex = 0;
  let cardsPerView = 1;
  let maxIndex = 0;
  let startX, startY;
  let isTouching = false;
  let isHorizontalSwipe = false;
  let startScrollLeft;
  let touchStartTime = 0;
  let trackWidth;
  let cardWidth;
  let cardGap = 20;
  let animationSpeed = 500; // ms
  
  // Initialize carousel
  function init() {
    // Determine cards per view based on screen width
    if (window.innerWidth >= 1024) {
      cardsPerView = 3;
    } else if (window.innerWidth >= 768) {
      cardsPerView = 2;
    } else {
      cardsPerView = 1;
    }
    
    // Calculate max index
    maxIndex = Math.max(0, cards.length - cardsPerView);
    
    // Get dimensions for calculations
    updateDimensions();
    
    // Create pagination dots
    createDots();
    
    // Update card styles based on view size
    updateCardStyles();
    
    // Reset to first slide
    goToSlide(0, false);
    
    // Ensure all cards are visible
    cards.forEach(card => {
      card.style.visibility = 'visible';
      card.style.opacity = '1';
    });
  }
  
  // Update dimensions used for calculations
  function updateDimensions() {
    // Get the first card's width including gap
    if (cards && cards.length > 0) {
      const cardRect = cards[0].getBoundingClientRect();
      cardWidth = cardRect.width;
      trackWidth = track.parentElement.clientWidth;
    }
  }
  
  // Update card styles based on view size - without fixed heights
  function updateCardStyles() {
    cards.forEach((card, index) => {
      // Give each card an index for easier reference
      card.dataset.index = index;
      
      // Only add hover effects on non-mobile devices
      if (window.innerWidth > 768) {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-5px)';
          card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.12)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.boxShadow = '';
        });
      }
    });
  }
  
  // Create pagination dots
  function createDots() {
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === currentIndex) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        goToSlide(i);
      });
      
      dotsContainer.appendChild(dot);
    }
  }
  
  // Go to specific slide with smooth animation
  function goToSlide(index, animated = true) {
    // Validate index
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;
    
    currentIndex = index;
    
    // Calculate target position
    const position = -index * (cardWidth + cardGap);
    
    // Animate the transition
    if (animated) {
      animateTrack(position);
    } else {
      track.style.transition = 'none';
      track.style.transform = `translateX(${position}px)`;
      // Force reflow
      track.offsetHeight;
      track.style.transition = `transform ${animationSpeed}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    }
    
    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
    
    // Update buttons
    if (prevBtn) prevBtn.classList.toggle('disabled', index === 0);
    if (nextBtn) nextBtn.classList.toggle('disabled', index === maxIndex);
  }
  
  // Smoothly animate the track to a position
  function animateTrack(targetPosition) {
    track.style.transition = `transform ${animationSpeed}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    track.style.transform = `translateX(${targetPosition}px)`;
  }
  
  // Touch handling for mobile swipe
  function initTouchHandling() {
    if (!track) return;
    
    track.addEventListener('touchstart', (e) => {
      isTouching = true;
      isHorizontalSwipe = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startScrollLeft = getTrackPosition();
      touchStartTime = Date.now();
      
      track.style.transition = 'none';
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
      if (!isTouching) return;
      
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const deltaX = startX - x;
      const deltaY = startY - y;
      
      // Determine if this is a horizontal swipe
      if (!isHorizontalSwipe) {
        // Only handle as horizontal swipe if movement is primarily horizontal
        // and after a minimum threshold to avoid interfering with page scrolling
        if (Math.abs(deltaX) > Math.abs(deltaY) * 2 && Math.abs(deltaX) > 15) {
          isHorizontalSwipe = true;
          
          // Prevent default to handle the horizontal scroll ourselves
          e.preventDefault();
        }
      }
      
      // Only handle horizontal swipes
      if (isHorizontalSwipe) {
        // Apply drag with resistance at edges
        let newPosition = startScrollLeft - deltaX;
        
        // Add resistance at edges
        if (newPosition > 0 || currentIndex === 0) {
          newPosition = startScrollLeft - deltaX * 0.3; // Add resistance
        } else if (currentIndex >= maxIndex && deltaX > 0) {
          newPosition = startScrollLeft - deltaX * 0.3; // Add resistance
        }
        
        track.style.transform = `translateX(${newPosition}px)`;
      }
    }, { passive: false });
    
    track.addEventListener('touchend', (e) => {
      if (!isTouching) return;
      
      isTouching = false;
      const touchDuration = Date.now() - touchStartTime;
      const currentPosition = getTrackPosition();
      const movement = startScrollLeft - currentPosition;
      
      // Only process swipe if it was a horizontal swipe
      if (isHorizontalSwipe) {
        // Determine direction and threshold for swiping
        if (Math.abs(movement) > cardWidth * 0.2 || (touchDuration < 300 && Math.abs(movement) > 30)) {
          if (movement > 0 && currentIndex < maxIndex) {
            goToSlide(currentIndex + 1);
          } else if (movement < 0 && currentIndex > 0) {
            goToSlide(currentIndex - 1);
          } else {
            // Snap back to current slide
            goToSlide(currentIndex);
          }
        } else {
          // Snap back to current slide
          goToSlide(currentIndex);
        }
      } else {
        // It was a vertical scroll or tap, do nothing
        goToSlide(currentIndex, false);
      }
      
      isHorizontalSwipe = false;
    }, { passive: true });
  }
  
  // Get current track position from transform
  function getTrackPosition() {
    const transform = window.getComputedStyle(track).getPropertyValue('transform');
    const matrix = new DOMMatrix(transform);
    return matrix.m41; // translateX value
  }
  
  // Add button event listeners with improved touch experience for mobile
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    });
    
    // Add touch-friendly handling for mobile
    prevBtn.addEventListener('touchstart', (e) => {
      // Add visual feedback
      prevBtn.style.transform = 'scale(0.95)';
    }, { passive: true });
    
    prevBtn.addEventListener('touchend', (e) => {
      // Remove visual feedback
      prevBtn.style.transform = '';
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    }, { passive: true });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < maxIndex) goToSlide(currentIndex + 1);
    });
    
    // Add touch-friendly handling for mobile
    nextBtn.addEventListener('touchstart', (e) => {
      // Add visual feedback
      nextBtn.style.transform = 'scale(0.95)';
    }, { passive: true });
    
    nextBtn.addEventListener('touchend', (e) => {
      // Remove visual feedback
      nextBtn.style.transform = '';
      if (currentIndex < maxIndex) goToSlide(currentIndex + 1);
    }, { passive: true });
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
      updateDimensions();
      init();
    }, 200);
  });
  
  // Initialize carousel
  init();
  
  // Initialize touch handling
  initTouchHandling();
}); 