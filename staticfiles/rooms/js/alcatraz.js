// Alcatraz room specific effects

document.addEventListener('DOMContentLoaded', () => {
  const detailItems = document.querySelectorAll('.detail-item');
  detailItems.forEach((item) => {
    item.addEventListener('mouseenter', function () {
      const icon = this.querySelector('.detail-icon');
      if (icon) {
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        icon.style.boxShadow = '0 5px 20px rgba(230, 57, 70, 0.5)';
      }
    });

    item.addEventListener('mouseleave', function () {
      const icon = this.querySelector('.detail-icon');
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
        icon.style.boxShadow = '0 3px 10px rgba(230, 57, 70, 0.3)';
      }
    });
  });
});
