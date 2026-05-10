(function() {
  const btn = document.getElementById('burgerBtn');
  const links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', () => links.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !links.contains(e.target)) links.classList.remove('open');
    });
  }
})();

// Parallax для how-section grid
window.addEventListener('scroll', () => {
  const section = document.querySelector('.how-section');
  if (!section) return;
  const scrollY = window.scrollY;
  const offset = scrollY * 0.3;
  section.style.backgroundPosition = `0px ${offset}px`;
});