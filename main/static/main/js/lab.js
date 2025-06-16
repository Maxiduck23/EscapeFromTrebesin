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
       '.story-intro, .room-description, .room-details, .detail-item, .gallery-item, .equipment-item, .reservation-section'
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
     
     // Difficulty stars animation - lab specific (4/5 stars)
     const difficultyStars = document.querySelectorAll('.difficulty span');
     difficultyStars.forEach((star, index) => {
       if (star.classList.contains('active')) {
         setTimeout(() => {
           star.style.animation = 'starGlow 2s ease-in-out infinite';
           star.style.animationDelay = ${index * 0.2}s;
         }, 1000 + index * 200);
       }
     });
     
     // Detail items hover effects with science theme
     const detailItems = document.querySelectorAll('.detail-item');
     detailItems.forEach(item => {
       item.addEventListener('mouseenter', function() {
         const icon = this.querySelector('.detail-icon');
         icon.style.transform = 'scale(1.2) rotate(5deg)';
         icon.style.boxShadow = '0 5px 20px rgba(46, 204, 113, 0.5)';
       });
       
       item.addEventListener('mouseleave', function() {
         const icon = this.querySelector('.detail-icon');
         icon.style.transform = 'scale(1) rotate(0deg)';
         icon.style.boxShadow = '0 3px 10px rgba(46, 204, 113, 0.3)';
       });
     });
 
     // Equipment items hover animation
     const equipmentItems = document.querySelectorAll('.equipment-item');
     equipmentItems.forEach(item => {
       item.addEventListener('mouseenter', function() {
         const icon = this.querySelector('.icon');
         icon.style.transform = 'scale(1.3) rotateY(180deg)';
         icon.style.filter = 'drop-shadow(0 0 10px rgba(46, 204, 113, 0.8))';
       });
       
       item.addEventListener('mouseleave', function() {
         const icon = this.querySelector('.icon');
         icon.style.transform = 'scale(1) rotateY(0deg)';
         icon.style.filter = 'none';
       });
     });
 
     // Gallery hover effects
     const galleryItems = document.querySelectorAll('.gallery-item');
     galleryItems.forEach(item => {
       item.addEventListener('mouseenter', function() {
         this.style.filter = 'brightness(1.1) contrast(1.1)';
       });
       
       item.addEventListener('mouseleave', function() {
         this.style.filter = 'brightness(1) contrast(1)';
       });
     });
 
     // Reservation button pulse effect
     const reservationBtn = document.querySelector('.reservation-section .btn');
     if (reservationBtn) {
       setInterval(() => {
         reservationBtn.style.animation = 'none';
         setTimeout(() => {
           reservationBtn.style.animation = 'pulse 1s ease-in-out';
         }, 10);
       }, 5000);
     }
 
     // Add extra CSS for pulse animation
     const style = document.createElement('style');
     style.textContent = 
       @keyframes pulse {
         0% { transform: scale(1); }
         50% { transform: scale(1.05); }
         100% { transform: scale(1); }
       }
     ;
     document.head.appendChild(style);
   });
