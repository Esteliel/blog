(function () {
  var header = document.querySelector('[data-site-header]');
  if (!header) return;

  var threshold = 24;
  var ticking = false;

  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > threshold);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}());
