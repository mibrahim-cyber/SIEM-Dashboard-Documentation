/**
 * Global command palette UI — wired to SiemCore.GlobalPalette
 */
(function () {
  'use strict';

  var overlay;
  var input;
  var list;
  var activeIdx = 0;
  var filtered = [];
  var open = false;

  function ensureDom() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'siem-palette-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Command palette');
    overlay.innerHTML =
      '<div id="siem-palette-panel">' +
      '<div id="siem-palette-input-wrap">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
      '<input id="siem-palette-input" type="search" autocomplete="off" spellcheck="false" placeholder="Jump to page or action…" aria-label="Search commands" />' +
      '</div>' +
      '<div id="siem-palette-list" role="listbox"></div>' +
      '<div id="siem-palette-footer"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('#siem-palette-input');
    list = overlay.querySelector('#siem-palette-list');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePalette();
    });
    input.addEventListener('input', function () { renderList(input.value); });
    input.addEventListener('keydown', onInputKey);
  }

  function allEntries() {
    if (window.SiemCore && window.SiemCore.GlobalPalette) {
      return window.SiemCore.GlobalPalette.entries();
    }
    return [];
  }

  function filterEntries(q) {
    var entries = allEntries();
    if (!q) return entries;
    var lower = q.toLowerCase();
    return entries.filter(function (e) {
      return (e.label || '').toLowerCase().indexOf(lower) !== -1 ||
        (e.group || '').toLowerCase().indexOf(lower) !== -1 ||
        (e.id || '').toLowerCase().indexOf(lower) !== -1;
    });
  }

  function renderList(q) {
    filtered = filterEntries(q);
    activeIdx = 0;
    if (!filtered.length) {
      list.innerHTML = '<div class="siem-palette-empty">No matching commands</div>';
      return;
    }
    var html = '';
    var lastGroup = '';
    filtered.forEach(function (e, i) {
      if (e.group && e.group !== lastGroup) {
        lastGroup = e.group;
        html += '<div class="siem-palette-group-label">' + escapeHtml(e.group) + '</div>';
      }
      html += '<div class="siem-palette-item' + (i === 0 ? ' siem-palette-item--active' : '') + '" role="option" data-idx="' + i + '">' +
        '<span class="siem-palette-item-label">' + escapeHtml(e.label) + '</span>' +
        (e.kbd ? '<span class="siem-palette-item-kbd">' + escapeHtml(e.kbd) + '</span>' : '') +
        '</div>';
    });
    list.innerHTML = html;
    list.querySelectorAll('.siem-palette-item').forEach(function (el) {
      el.addEventListener('click', function () {
        selectIdx(parseInt(el.getAttribute('data-idx'), 10));
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightIdx() {
    list.querySelectorAll('.siem-palette-item').forEach(function (el, i) {
      el.classList.toggle('siem-palette-item--active', i === activeIdx);
    });
    var active = list.querySelector('.siem-palette-item--active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function selectIdx(idx) {
    var entry = filtered[idx];
    if (!entry) return;
    closePalette();
    if (entry.action === 'achievements') {
      if (window.SiemCore) window.SiemCore.AchievementSystem.check('palette_open');
      location.assign(entry.href || 'trophy.html');
      return;
    }
    if (entry.href) location.assign(entry.href);
  }

  function onInputKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(filtered.length - 1, activeIdx + 1);
      highlightIdx();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(0, activeIdx - 1);
      highlightIdx();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectIdx(activeIdx);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  }

  function openPalette() {
    ensureDom();
    if (open) return;
    open = true;
    overlay.classList.add('siem-palette--open');
    input.value = '';
    renderList('');
    requestAnimationFrame(function () { input.focus(); });
  }

  function closePalette() {
    if (!open) return;
    open = false;
    overlay.classList.remove('siem-palette--open');
    if (window.SiemCore) window.SiemCore.GlobalPalette.close();
  }

  document.addEventListener('siem-palette-open', openPalette);
  document.addEventListener('siem-palette-close', closePalette);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) closePalette();
  });

  if (window.SiemCore) window.SiemCore.GlobalPalette.init();
})();
