/* animations.js */

(function () {
  const STAGGER_STEP = 0.06; // seconds between staggered children

  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    /* Observe all .reveal-up elements that are NOT inside .hero */
    document.querySelectorAll('.reveal-up').forEach(el => {
      if (!el.closest('.hero')) {
        observer.observe(el);
      }
    });

    /* Stagger grid items — cert cards and org cards */
    applyStagger('.certs-grid .cert-card');
    applyStagger('.orgs-grid .org-card');
  }

  function applyStagger(selector) {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.setProperty('--stagger', `${i * STAGGER_STEP}s`);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
})();
