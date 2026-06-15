/* ═══════════════════════════════════════════════════════════════
   cursor-trail.js — soft ambient glow that follows the cursor
   · Hidden on touch-only devices (no cursor)
   · Disabled when prefers-reduced-motion is set
   · Theme-sensitive via --glow-color CSS custom property
═══════════════════════════════════════════════════════════════ */

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.setAttribute('aria-hidden', 'true');

  Object.assign(glow.style, {
    position:        'fixed',
    top:             '0',
    left:            '0',
    width:           '520px',
    height:          '520px',
    borderRadius:    '50%',
    background:      'radial-gradient(circle, var(--glow-color) 0%, transparent 70%)',
    transform:       'translate(-50%, -50%)',
    pointerEvents:   'none',
    zIndex:          '9999',
    willChange:      'transform',
    opacity:         '0',
    transition:      'opacity 0.6s ease',
  });

  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX  = 0, glowY  = 0;
  let visible = false;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!visible) {
      glowX = mouseX;
      glowY = mouseY;
      glow.style.opacity = '1';
      visible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    visible = false;
  });

  function animate() {
    /* Lerp factor — lower = smoother/lazier follow */
    const LERP = 0.10;
    glowX += (mouseX - glowX) * LERP;
    glowY += (mouseY - glowY) * LERP;

    glow.style.transform = `translate(calc(${glowX}px - 50%), calc(${glowY}px - 50%))`;
    raf = requestAnimationFrame(animate);
  }

  raf = requestAnimationFrame(animate);
})();
