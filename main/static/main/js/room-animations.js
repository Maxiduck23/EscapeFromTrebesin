// Common animations for room pages

function initRoomAnimations() {
  // Scroll-based reveal
  const elements = document.querySelectorAll(
    '.story-intro, .room-description, .room-details, .detail-item, .gallery-item, .reservation-section'
  );
  if (elements.length) {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }, observerOptions);
    elements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(el);
    });
  }

  // Story intro pulse
  const storyIntro = document.getElementById('storyIntro');
  if (storyIntro) {
    storyIntro.addEventListener('click', function () {
      this.style.animation = 'none';
      setTimeout(() => {
        this.style.animation = 'pulse 0.8s ease';
      }, 10);
    });
  }

  // Difficulty stars glow
  const difficultyStars = document.querySelectorAll('.difficulty span.active');
  difficultyStars.forEach((star, index) => {
    setTimeout(() => {
      star.style.animation = 'starGlow 2s ease-in-out infinite';
      star.style.animationDelay = `${index * 0.3}s`;
    }, 1000);
  });

  // Detail item hover scaling
  const detailItems = document.querySelectorAll('.detail-item');
  detailItems.forEach((item) => {
    item.addEventListener('mouseenter', function () {
      const icon = this.querySelector('.detail-icon');
      if (icon) {
        icon.style.transform = 'scale(1.2) rotate(5deg)';
      }
    });
    item.addEventListener('mouseleave', function () {
      const icon = this.querySelector('.detail-icon');
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
      }
    });
  });

  // Reservation button pulse
  const reservationBtn = document.querySelector('.reservation-section .btn');
  if (reservationBtn) {
    setInterval(() => {
      reservationBtn.style.animation = 'btnPulse 2s ease';
      setTimeout(() => {
        reservationBtn.style.animation = '';
      }, 2000);
    }, 5000);
  }

  // Inject common keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    @keyframes starGlow {
      0%, 100% {
        box-shadow: 0 0 10px rgba(230, 57, 70, 0.5);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 20px rgba(230, 57, 70, 0.8);
        transform: scale(1.1);
      }
    }

    @keyframes btnPulse {
      0% {
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateY(-3px) scale(1);
      }
      50% {
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        transform: translateY(-5px) scale(1.05);
      }
      100% {
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateY(-3px) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', initRoomAnimations);
