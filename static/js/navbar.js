document.addEventListener('DOMContentLoaded', function() {
    // Get navbar elements
    const navbar = document.querySelector('.navbar');
    const navbarBurger = document.querySelector('.navbar-burger');
    const navbarMenu = document.getElementById('navbarMenu');
    const dropdowns = document.querySelectorAll('.navbar-item.has-dropdown');
    
    // Fix iOS Safari bug by ensuring menu starts closed
    if (navbarMenu) {
        navbarMenu.classList.remove('is-active');
    }
    
    // Mobile menu toggle
    if (navbarBurger) {
        navbarBurger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            navbarBurger.classList.toggle('is-active');
            
            if (navbarMenu) {
                setTimeout(() => {
                    navbarMenu.classList.toggle('is-active');
                }, 10);
            }
            
            const expanded = navbarBurger.classList.contains('is-active');
            navbarBurger.setAttribute('aria-expanded', expanded);
        });
    }
    
    // Improve mobile dropdown handling
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('.navbar-link');
        
        dropdownLink?.addEventListener('click', function(e) {
            if (window.innerWidth < 1024) {
                e.preventDefault();
                e.stopPropagation();
                
                dropdowns.forEach(other => {
                    if (other !== dropdown && other.classList.contains('is-active')) {
                        other.classList.remove('is-active');
                    }
                });
                
                dropdown.classList.toggle('is-active');
            }
        });
    });
    
    // Close mobile menu when clicking menu items
    const navbarItems = document.querySelectorAll('.navbar-menu .navbar-item:not(.has-dropdown), .navbar-menu .navbar-dropdown .navbar-item');
    navbarItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth < 1024 && navbarMenu?.classList.contains('is-active')) {
                navbarBurger.classList.remove('is-active');
                navbarMenu.classList.remove('is-active');
                navbarBurger.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Navbar scroll effect
    function updateNavbarOnScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add('is-scrolled');
        } else {
            navbar.classList.remove('is-scrolled');
        }
    }
    
    updateNavbarOnScroll();
    window.addEventListener('scroll', updateNavbarOnScroll);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) {
            if (navbarBurger?.classList.contains('is-active')) {
                navbarBurger.classList.remove('is-active');
                navbarBurger.setAttribute('aria-expanded', 'false');
            }
            
            if (navbarMenu?.classList.contains('is-active')) {
                navbarMenu.classList.remove('is-active');
            }
            
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('is-active');
            });
        }
    });
    
    // Handle clicks outside menu
    document.addEventListener('click', function(event) {
        if (!navbar.contains(event.target) && window.innerWidth < 1024) {
            if (navbarMenu?.classList.contains('is-active')) {
                navbarBurger.classList.remove('is-active');
                navbarMenu.classList.remove('is-active');
                navbarBurger.setAttribute('aria-expanded', 'false');
            }
            
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('is-active');
            });
        }
    });
});