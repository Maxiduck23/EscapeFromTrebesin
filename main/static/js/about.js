  // Enhanced Accordion Functionality
  document.addEventListener('DOMContentLoaded', function() {
    const accordions = document.getElementsByClassName('accordion');
    
    for (let i = 0; i < accordions.length; i++) {
      accordions[i].addEventListener('click', function() {
        // Close all other accordions
        for (let j = 0; j < accordions.length; j++) {
          if (accordions[j] !== this) {
            accordions[j].classList.remove('active');
            accordions[j].nextElementSibling.classList.remove('open');
          }
        }
        
        // Toggle current accordion
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        panel.classList.toggle('open');
      });
    }
    
    // Add animation on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.about-card, .accordion').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
    
    // Interactive mission text
    const missionText = document.getElementById('missionText');
    if (missionText) {
      missionText.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => {
          this.style.animation = 'pulse 0.6s ease';
        }, 10);
      });
    }
  });
  
  // Pulse animation for mission text
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

