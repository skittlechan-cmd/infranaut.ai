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
});

// Video Controls
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('heroVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const playIcon = '<i class="fas fa-play"></i>';
    const pauseIcon = '<i class="fas fa-pause"></i>';
    const volumeOnIcon = '<i class="fas fa-volume-up"></i>';
    const volumeOffIcon = '<i class="fas fa-volume-mute"></i>';

    // Initialize video state
    video.muted = true; // Start muted by default

    playPauseBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = pauseIcon;
        } else {
            video.pause();
            playPauseBtn.innerHTML = playIcon;
        }
    });

    muteBtn.addEventListener('click', function() {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? volumeOffIcon : volumeOnIcon;
    });

    // Update button state when video ends
    video.addEventListener('ended', function() {
        playPauseBtn.innerHTML = playIcon;
    });

    // Ensure video controls are updated if video is played/paused programmatically
    video.addEventListener('play', function() {
        playPauseBtn.innerHTML = pauseIcon;
    });

    video.addEventListener('pause', function() {
        playPauseBtn.innerHTML = playIcon;
    });
});