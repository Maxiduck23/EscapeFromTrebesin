// Tomb room specific animations

document.addEventListener('DOMContentLoaded', () => {
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item) => {
    item.addEventListener('click', function () {
      this.style.animation = 'flash 0.3s ease';
      setTimeout(() => {
        this.style.animation = '';
      }, 300);
    });
  });
});

// Keyframes for gallery flash
const style = document.createElement('style');
style.textContent = `
  @keyframes flash {
    0% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
    100% { filter: brightness(1); }
  }
`;
document.head.appendChild(style);
