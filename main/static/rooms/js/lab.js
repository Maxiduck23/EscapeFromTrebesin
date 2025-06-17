

document.addEventListener('DOMContentLoaded', () => {
  const equipmentItems = document.querySelectorAll('.equipment-item');
  equipmentItems.forEach((item) => {
    item.addEventListener('mouseenter', function () {
      const icon = this.querySelector('.icon');
      if (icon) {
        icon.style.transform = 'scale(1.3) rotateY(180deg)';
        icon.style.filter = 'drop-shadow(0 0 10px rgba(46, 204, 113, 0.8))';
      }
    });

    item.addEventListener('mouseleave', function () {
      const icon = this.querySelector('.icon');
      if (icon) {
        icon.style.transform = 'scale(1) rotateY(0deg)';
        icon.style.filter = 'none';
      }
    });
  });
});
