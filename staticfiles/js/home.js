    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const finalValue = stat.textContent.trim();
                    const isPercentage = finalValue.includes('%');
                    if (finalValue.includes('-')) {
                        return;
                    }

                    const numericValue = parseInt(finalValue.replace(/\D/g, ''), 10);
                    
                    let current = 0;
                    const increment = numericValue / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= numericValue) {
                            current = numericValue;
                            clearInterval(timer);
                        }
                        stat.textContent = Math.floor(current) + (isPercentage ? '%' : '');
                    }, 40);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Add loading animation for room cards
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('fade-in-up');
    });

// Additional effects for reservation section
document.addEventListener('DOMContentLoaded', function() {
    // Scroll animation similar to lab.js
    const reservationSection = document.querySelector('.reservation-section');
    if (reservationSection) {
        const reservationObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    reservationObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        reservationSection.style.opacity = '0';
        reservationSection.style.transform = 'translateY(30px)';
        reservationSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        reservationObserver.observe(reservationSection);
    }

    // Periodic pulse effect for the reservation button
    const reservationBtn = document.querySelector('.reservation-section .btn');
    if (reservationBtn) {
        setInterval(() => {
            reservationBtn.style.animation = 'none';
            setTimeout(() => {
                reservationBtn.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        }, 5000);
    }

    // Inject @keyframes pulse if not already present
    if (!document.getElementById('home-pulse-keyframes')) {
        const style = document.createElement('style');
        style.id = 'home-pulse-keyframes';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
});
