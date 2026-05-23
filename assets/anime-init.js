import { animate, stagger } from 'animejs';

window.siemAnimate = { animate, stagger, ready: true };
window.dispatchEvent(new CustomEvent('siem-animate-ready'));
