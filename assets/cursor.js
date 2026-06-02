/**
 * Custom cursor — two-ring system
 * Outer ring (32px) follows with lerp 0.12 lag
 * Inner dot (8px) snaps instantly
 * Scales on hover, pulses on click
 */
(function () {
  'use strict';

  if (matchMedia('(pointer: coarse)').matches) return; // touch devices

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var outer = document.createElement('div');
  var inner = document.createElement('div');
  var style = document.createElement('style');

  style.textContent =
    '#siem-cursor-outer{position:fixed;pointer-events:none;z-index:9999;width:32px;height:32px;' +
    'border-radius:50%;border:1.5px solid rgba(56,189,248,0.6);transform:translate(-50%,-50%);' +
    'transition:width 0.2s ease,height 0.2s ease,border-color 0.2s ease,background 0.2s ease;' +
    'will-change:transform,left,top;left:0;top:0}' +
    '#siem-cursor-inner{position:fixed;pointer-events:none;z-index:10000;width:8px;height:8px;' +
    'border-radius:50%;background:rgba(56,189,248,0.9);transform:translate(-50%,-50%);' +
    'will-change:transform,left,top;left:0;top:0}' +
    '#siem-cursor-outer.hover{width:60px;height:60px;border-color:rgba(56,189,248,0.8);' +
    'background:rgba(56,189,248,0.08)}' +
    '#siem-cursor-outer.click{animation:cursorPulse 0.3s ease-out forwards}' +
    '@keyframes cursorPulse{0%{transform:translate(-50%,-50%) scale(1);opacity:1}' +
    '100%{transform:translate(-50%,-50%) scale(1.8);opacity:0}}' +
    'body{cursor:none!important}' +
    'a,button,.card,.btn,[data-tilt],[data-ripple],input,select,textarea,label,' +
    '[role=button],[tabindex]:not([tabindex="-1"]){cursor:none!important}';

  document.head.appendChild(style);

  outer.id = 'siem-cursor-outer';
  inner.id = 'siem-cursor-inner';
  document.body.appendChild(outer);
  document.body.appendChild(inner);

  var mx = -100, my = -100;
  var ox = -100, oy = -100;
  var lerp = REDUCED ? 1 : 0.12;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    inner.style.left = mx + 'px';
    inner.style.top = my + 'px';
  });

  function loop() {
    ox += (mx - ox) * lerp;
    oy += (my - oy) * lerp;
    outer.style.left = ox + 'px';
    outer.style.top = oy + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  // Hover detection
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest('a,button,.card,.btn,[data-tilt],[data-ripple],input,select,textarea,label,[role=button],[tabindex]:not([tabindex="-1"])');
    if (t) outer.classList.add('hover');
  });
  document.addEventListener('mouseout', function (e) {
    var t = e.target.closest('a,button,.card,.btn,[data-tilt],[data-ripple],input,select,textarea,label,[role=button],[tabindex]:not([tabindex="-1"])');
    if (t) outer.classList.remove('hover');
  });

  // Click pulse
  document.addEventListener('mousedown', function () {
    outer.classList.add('click');
    setTimeout(function () { outer.classList.remove('click'); }, 300);
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', function () {
    outer.style.opacity = '0';
    inner.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    outer.style.opacity = '1';
    inner.style.opacity = '1';
  });
})();
