// Enhanced home.js with advanced animations

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

// Add loading animation for room cards with stagger effect
const roomCards = document.querySelectorAll('.room-card');
roomCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
    card.classList.add('fade-in-up');

    // Add advanced hover effects
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-15px) scale(1.02) rotateX(5deg)';
        this.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
    });
});

// Enhanced DOMContentLoaded animations
document.addEventListener('DOMContentLoaded', function () {
    // Parallax scroll effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Scroll-triggered animations for all sections
    const animatedElements = document.querySelectorAll('.testimonials, .experience-section, .cta-section');
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';

                // Add entrance class for CTA section
                if (entry.target.classList.contains('cta-section')) {
                    entry.target.classList.add('animate-entrance');
                }

                intersectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        intersectionObserver.observe(el);
    });

    // Enhanced CTA section with periodic pulse effect
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        const ctaObserver = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-entrance');

                    // Start periodic pulse effect for the button
                    const ctaBtn = entry.target.querySelector('.btn-cta');
                    if (ctaBtn) {
                        setTimeout(() => {
                            setInterval(() => {
                                ctaBtn.style.animation = 'none';
                                setTimeout(() => {
                                    ctaBtn.style.animation = 'buttonPulse 2s ease-in-out';
                                }, 50);
                            }, 6000); // Pulse every 6 seconds
                        }, 2000); // Wait 2 seconds before starting
                    }

                    ctaObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });

        ctaObserver.observe(ctaSection);
    }

    // Testimonial cards stagger animation
    const testimonialCards = document.querySelectorAll('.testimonial');
    testimonialCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;

        const testimonialObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.2 });

        testimonialObserver.observe(card);
    });

    // Advanced button hover effects with ripple
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            if (!this.classList.contains('btn-cta')) {
                this.style.transform = 'translateY(-3px) scale(1.05)';
                this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }
        });

        btn.addEventListener('mouseleave', function () {
            if (!this.classList.contains('btn-cta')) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            }
        });

        // Add ripple effect on click
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Inject enhanced keyframes if not already present
    if (!document.getElementById('enhanced-home-keyframes')) {
        const style = document.createElement('style');
        style.id = 'enhanced-home-keyframes';
        style.textContent = `
            .animate-entrance h2 {
                animation: slideInFromTop 1s ease-out;
            }

            .animate-entrance p {
                animation: slideInFromBottom 1s ease-out 0.2s both;
            }

            .animate-entrance .btn-cta {
                animation: buttonEntrance 1s ease-out 0.4s both;
            }

            @keyframes slideInFromTop {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes slideInFromBottom {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes buttonEntrance {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    console.log('🎨 Enhanced home animations loaded');
});