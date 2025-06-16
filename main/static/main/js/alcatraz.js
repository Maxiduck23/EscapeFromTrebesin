  document.addEventListener('DOMContentLoaded', function() {
    // Enhanced animation on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Staggered animation delay
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll(
      '.story-intro, .room-description, .room-details, .detail-item, .gallery-item, .reservation-section'
    );
    
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(el);
    });
    
    // Interactive story intro
    const storyIntro = document.getElementById('storyIntro');
    if (storyIntro) {
      storyIntro.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => {
          this.style.animation = 'pulse 0.8s ease';
        }, 10);
      });
    }
    
    // Difficulty stars animation - special for Alcatraz (all 5 stars)
    const difficultyStars = document.querySelectorAll('.difficulty span');
    difficultyStars.forEach((star, index) => {
      if (star.classList.contains('active')) {
        setTimeout(() => {
          star.style.animation = 'starGlow 2s ease-in-out infinite';
          star.style.animationDelay = `${index * 0.2}s`;
        }, 1000 + index * 200);
      }
    });
    
    // Detail items hover effects with prison theme
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
      item.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.detail-icon');
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        icon.style.boxShadow = '0 5px 20px rgba(230, 57, 70, 0.5)';
      });
      
      item.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.detail-icon');
        icon.style.transform = 'scale(1) rotate(0deg)';
        icon.style.boxShadow = '0 3px 10px rgba(230, 57, 70, 0.3)';
      });
    });
    
    // Gallery lightbox effect with prison atmosphere
    const gallery
