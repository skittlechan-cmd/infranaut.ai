// Scroll Animation Script
document.addEventListener('DOMContentLoaded', function() {
  initScrollAnimations();
});

function initScrollAnimations() {
  // Animate elements that should be revealed on scroll
  const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-on-scroll-left, .reveal-on-scroll-right, .infra-cta-box, .hero-image-container');
  
  // Initialize Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // When element is in viewport
      if (entry.isIntersecting) {
        // Add animation class
        entry.target.classList.add('animated');
        // Unobserve once animated to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, {
    // Options
    threshold: 0.1, // Trigger when at least 10% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Slightly earlier trigger before fully in view
  });
  
  // Observe each element
  revealElements.forEach(el => {
    observer.observe(el);
  });
  
  // Optional: Add animation to already visible elements on page load
  setTimeout(() => {
    const viewportHeight = window.innerHeight;
    
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.9) {
        el.classList.add('animated');
        observer.unobserve(el);
      }
    });
  }, 100);
  
  // Handle cards animation with staggered effect
  animateCards();
}

function animateCards() {
  // Target all card types that should animate on scroll
  const cardSelectors = [
    '.infra-feature-card', 
    '.service-card:not(.active)', 
    '.module-card',
    '.testimonial-card'
  ];
  
  const allCards = document.querySelectorAll(cardSelectors.join(', '));
  
  // Initialize card observer with slightly different threshold
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay based on card position
        setTimeout(() => {
          entry.target.classList.add('animated');
        }, index % 5 * 100); // Stagger in groups of 5
        
        cardObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });
  
  // Observe each card
  allCards.forEach(card => {
    cardObserver.observe(card);
  });
}

// Detect scroll direction for enhanced animation effects
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
  const st = window.pageYOffset || document.documentElement.scrollTop;
  const scrollDirection = st > lastScrollTop ? 'down' : 'up';
  
  // Update the scroll direction attribute for potential CSS animations
  document.documentElement.setAttribute('data-scroll-direction', scrollDirection);
  lastScrollTop = st <= 0 ? 0 : st;
}, false);

// Handle resize events to recalculate animations if needed
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    // Refresh animations for newly visible elements after resize
    const animatedElements = document.querySelectorAll('.reveal-on-scroll:not(.animated), .reveal-on-scroll-left:not(.animated), .reveal-on-scroll-right:not(.animated)');
    
    const viewportHeight = window.innerHeight;
    animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.9) {
        el.classList.add('animated');
      }
    });
  }, 200);
}); 