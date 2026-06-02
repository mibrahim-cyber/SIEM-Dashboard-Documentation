/**
 * HABIBI-SIEM — Component JS Handlers
 * Auto-initializes interactive components on DOMContentLoaded
 */
(function (global) {
  'use strict';

  var INITIALIZED = false;

  /* ── Toast system ── */
  var Toast = {
    _container: null,

    _ensureContainer: function () {
      if (this._container) return this._container;
      this._container = document.createElement('div');
      this._container.id = 'siem-toast-container';
      this._container.style.cssText =
        'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
      document.body.appendChild(this._container);
      return this._container;
    },

    show: function (message, type) {
      type = type || 'info';
      var container = this._ensureContainer();
      var el = document.createElement('div');
      el.className = 'toast toast--' + type;
      el.setAttribute('role', 'status');
      el.innerHTML = '<span>' + message + '</span><button class="toast-close" aria-label="Dismiss">&times;</button>';
      el.style.pointerEvents = 'auto';
      container.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('toast--visible'); });
      el.querySelector('.toast-close').addEventListener('click', function () { Toast.dismiss(el); });
      setTimeout(function () { Toast.dismiss(el); }, 4000);
    },

    dismiss: function (el) {
      if (!el || el._dismissing) return;
      el._dismissing = true;
      el.classList.remove('toast--visible');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
    },
  };

  /* ── Modal system ── */
  var Modal = {
    open: function (contentHtml, opts) {
      opts = opts || {};
      var overlay = document.createElement('div');
      overlay.className = 'modal-base';
      var card = document.createElement('div');
      card.className = 'modal-card';
      card.innerHTML =
        '<button class="modal-close" aria-label="Close">&times;</button>' +
        '<div class="modal-body">' + contentHtml + '</div>';
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      requestAnimationFrame(function () { overlay.classList.add('modal-base--open'); });

      var close = function () {
        overlay.classList.remove('modal-base--open');
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
      };

      card.querySelector('.modal-close').addEventListener('click', close);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
      });

      if (opts.onOpen) opts.onOpen(card.querySelector('.modal-body'));
      return { close: close, el: overlay };
    },

    confirm: function (message, opts) {
      opts = opts || {};
      return new Promise(function (resolve) {
        var html =
          '<p style="margin-bottom:16px;font-size:13px;color:var(--text-secondary)">' + message + '</p>' +
          '<div class="modal-confirm-actions">' +
          '<button class="btn-secondary" data-action="cancel">Cancel</button>' +
          '<button class="btn-primary" data-action="confirm">' + (opts.confirmText || 'Confirm') + '</button>' +
          '</div>';
        var m = Modal.open(html);
        m.el.querySelector('[data-action="confirm"]').addEventListener('click', function () { m.close(); resolve(true); });
        m.el.querySelector('[data-action="cancel"]').addEventListener('click', function () { m.close(); resolve(false); });
      });
    },
  };

  /* ── Tooltip system ── */
  var Tooltip = {
    _el: null,

    _getEl: function () {
      if (!this._el) {
        this._el = document.createElement('div');
        this._el.className = 'tooltip';
        document.body.appendChild(this._el);
      }
      return this._el;
    },

    show: function (el, text, position) {
      position = position || 'top';
      var tip = this._getEl();
      tip.textContent = text;
      tip.className = 'tooltip tooltip--' + position;
      var rect = el.getBoundingClientRect();
      var tipRect;
      tip.style.display = 'block';
      requestAnimationFrame(function () {
        tipRect = tip.getBoundingClientRect();
        if (position === 'top') {
          tip.style.left = (rect.left + rect.width / 2 - tipRect.width / 2) + 'px';
          tip.style.top = (rect.top - tipRect.height - 8) + 'px';
        } else {
          tip.style.left = (rect.left + rect.width / 2 - tipRect.width / 2) + 'px';
          tip.style.top = (rect.bottom + 8) + 'px';
        }
        tip.classList.add('tooltip--visible');
      });
    },

    hide: function () {
      var tip = this._getEl();
      tip.classList.remove('tooltip--visible');
      setTimeout(function () { tip.style.display = ''; }, 200);
    },
  };

  /* ── Collapsible ── */
  function initCollapsibles() {
    document.querySelectorAll('.collapsible').forEach(function (el) {
      var header = el.querySelector('.collapsible-header');
      if (!header || el._collapsibleBound) return;
      el._collapsibleBound = true;
      header.addEventListener('click', function () {
        el.classList.toggle('collapsible--open');
      });
    });
  }

  /* ── Tabs ── */
  function initTabs() {
    document.querySelectorAll('.nav-tabs').forEach(function (container) {
      container.querySelectorAll('.nav-tab').forEach(function (tab) {
        if (tab._tabBound) return;
        tab._tabBound = true;
        tab.addEventListener('click', function () {
          container.querySelectorAll('.nav-tab').forEach(function (t) { t.classList.remove('nav-tab--active'); });
          tab.classList.add('nav-tab--active');
          var target = tab.getAttribute('data-tab');
          if (target) {
            var parent = container.closest('[data-tab-group]') || container.parentElement;
            parent.querySelectorAll('[data-tab-panel]').forEach(function (p) { p.style.display = 'none'; });
            var panel = parent.querySelector('[data-tab-panel="' + target + '"]');
            if (panel) panel.style.display = '';
          }
        });
      });
    });
  }

  /* ── Toggle ── */
  function initToggles() {
    document.querySelectorAll('.toggle').forEach(function (el) {
      if (el._toggleBound) return;
      el._toggleBound = true;
      el.addEventListener('click', function () {
        el.classList.toggle('toggle--on');
        var onChange = el.getAttribute('data-on-change');
        if (onChange && typeof global[onChange] === 'function') {
          global[onChange](el.classList.contains('toggle--on'));
        }
      });
    });
  }

  /* ── Search input ── */
  function initSearchInputs() {
    document.querySelectorAll('.input-search-wrap').forEach(function (wrap) {
      var input = wrap.querySelector('.input-base');
      var clear = wrap.querySelector('.input-search-clear');
      if (!input || !clear || wrap._searchBound) return;
      wrap._searchBound = true;
      input.addEventListener('input', function () {
        wrap.classList.toggle('has-value', input.value.length > 0);
      });
      clear.addEventListener('click', function () {
        input.value = '';
        wrap.classList.remove('has-value');
        input.focus();
        input.dispatchEvent(new Event('input'));
      });
    });
  }

  /* ── Code block copy ── */
  function initCodeBlocks() {
    document.querySelectorAll('.code-block-copy').forEach(function (btn) {
      if (btn._copyBound) return;
      btn._copyBound = true;
      btn.addEventListener('click', function () {
        var code = btn.closest('.code-block').querySelector('code');
        if (!code) return;
        var text = code.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = 'Copied!';
            btn.classList.add('code-block-copy--done');
            setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('code-block-copy--done'); }, 2000);
          });
        }
      });
    });
  }

  /* ── Back to top ── */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    var scrollHandler = function () {
      btn.classList.toggle('back-to-top--visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Scroll progress bar ── */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* ── Fade-up observer ── */
  function initFadeUp() {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-up--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(function (el) { observer.observe(el); });
  }

  /* ── Ripple effect on buttons ── */
  function initRipple() {
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger, .btn-gold, .btn-angled').forEach(function (btn) {
      if (btn._rippleBound) return;
      btn._rippleBound = true;
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var r = document.createElement('span');
        r.style.cssText =
          'position:absolute;border-radius:50%;background:rgba(255,255,255,0.3);' +
          'width:20px;height:20px;left:' + (e.clientX - rect.left - 10) + 'px;' +
          'top:' + (e.clientY - rect.top - 10) + 'px;' +
          'transform:scale(0);animation:rippleOut 0.5s ease-out forwards;pointer-events:none';
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(r);
        setTimeout(function () { r.remove(); }, 600);
      });
    });
  }

  /* ── Keyboard shortcuts ── */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      // Escape closes modals
      if (e.key === 'Escape') {
        var openModal = document.querySelector('.modal-base--open');
        if (openModal) {
          openModal.classList.remove('modal-base--open');
          setTimeout(function () { if (openModal.parentNode) openModal.parentNode.removeChild(openModal); }, 300);
        }
      }
      // ? shows shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        var shortcuts = [
          '<kbd>Ctrl+K</kbd> Open command palette',
          '<kbd>?</kbd> Show this help',
          '<kbd>Esc</kbd> Close modal',
          '<kbd>M</kbd> Toggle mute',
        ];
        var html = '<h3 style="margin-bottom:12px;font-family:var(--font-mono);font-size:13px;color:var(--cyan)">Keyboard Shortcuts</h3>' +
          shortcuts.map(function (s) { return '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid var(--border-subtle)">' + s + '</div>'; }).join('');
        Modal.open(html);
      }
      // M toggles mute
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey && !e.target.closest('input,textarea,select')) {
        if (global.SiemSounds) global.SiemSounds.toggleMute();
      }
    });
  }

  /* ── Init everything ── */
  function init() {
    if (INITIALIZED) return;
    INITIALIZED = true;

    initCollapsibles();
    initTabs();
    initToggles();
    initSearchInputs();
    initCodeBlocks();
    initBackToTop();
    initScrollProgress();
    initFadeUp();
    initRipple();
    initKeyboardShortcuts();

    // Expose Toast and Modal globally
    global.SiemToast = Toast;
    global.SiemModal = Modal;
    global.SiemTooltip = Tooltip;
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also expose init for manual calls
  global.SiemComponents = { init: init, Toast: Toast, Modal: Modal, Tooltip: Tooltip };

})(typeof window !== 'undefined' ? window : this);
