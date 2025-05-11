// Smooth Scroll Utility for Mobile
document.addEventListener('DOMContentLoaded', function() {
  // Enable smooth scrolling for in-page links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      e.preventDefault();
      
      // Smoother scrolling with customized behavior
      const offset = 60; // Account for fixed headers
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      // Use native smooth scrolling with fallback
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        // Fallback for browsers without smooth scrolling support
        window.scrollTo(0, offsetPosition);
      }
    });
  });
  
  // Prevent carousels from interfering with page scrolling on mobile
  function optimizeCarousels() {
    // Check if mobile
    const isMobile = window.innerWidth <= 640;
    
    if (isMobile) {
      // Add passive touch listeners to improve scroll performance
      const carousels = document.querySelectorAll('.service-carousel, .testimonial-track-container');
      carousels.forEach(carousel => {
        // Remove any existing touch handlers to prevent duplicates
        carousel.removeEventListener('touchstart', carouselTouchStart);
        carousel.removeEventListener('touchmove', carouselTouchMove);
        
        // Add new event listeners
        carousel.addEventListener('touchstart', carouselTouchStart, { passive: true });
        carousel.addEventListener('touchmove', carouselTouchMove, { passive: true });
      });
      
      // Optimize card heights for mobile
      const serviceCards = document.querySelectorAll('.service-card');
      serviceCards.forEach(card => {
        // Don't override height completely, just set a reasonable max height
        card.style.maxHeight = '300px'; // Ensure cards aren't too tall on mobile
      });
      
      // Make scroll indicators more visible on mobile
      const scrollIndicators = document.querySelectorAll('.scroll-prev, .scroll-next');
      scrollIndicators.forEach(indicator => {
        indicator.style.opacity = '0.8';
        indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      });
    }
  }
  
  // Touch event handlers - defined as named functions to allow removal
  function carouselTouchStart(e) {
    this.setAttribute('data-touch-start-y', e.touches[0].clientY);
    this.setAttribute('data-touch-start-x', e.touches[0].clientX);
  }
  
  function carouselTouchMove(e) {
    const startY = parseInt(this.getAttribute('data-touch-start-y') || 0);
    const startX = parseInt(this.getAttribute('data-touch-start-x') || 0);
    const deltaY = startY - e.touches[0].clientY;
    const deltaX = startX - e.touches[0].clientX;
    
    // If clearly vertical scrolling, make sure we don't interfere
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      this.style.overflow = 'visible';
      this.style.touchAction = 'pan-y'; // Allow vertical scrolling
    }
  }
  
  // Run optimization
  optimizeCarousels();
  
  // Reapply on resize
  window.addEventListener('resize', function() {
    optimizeCarousels();
  });
}); 