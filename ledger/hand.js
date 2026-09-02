/* THE LEDGER — handwriting realism.
   A web font can't look hand-written: every "a" is identical. This splits
   marked text into per-WORD wrappers (each with its own baseline drift + tilt)
   and per-CHARACTER spans (rotation, baseline, size, spacing, ink pressure),
   all DETERMINISTIC (seeded by the text). Base font is Shadows Into Light Two. */
window.HAND = (function () {
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }

  function charSpan(ch, r) {
    var s = document.createElement('span');
    s.className = 'g';
    s.textContent = ch;
    s.style.setProperty('--r', ((r() * 2 - 1) * 3.2).toFixed(2) + 'deg');
    s.style.setProperty('--y', ((r() * 2 - 1) * 2.2).toFixed(2) + 'px');
    s.style.setProperty('--s', (0.9 + r() * 0.2).toFixed(3));
    s.style.setProperty('--ls', ((r() * 2 - 1) * 1.4).toFixed(2) + 'px');
    var p = r();
    if (p < 0.12) { s.style.setProperty('--w', '700'); s.style.setProperty('--o', '1'); }
    else if (p > 0.9) { s.style.setProperty('--o', (0.42 + r() * 0.2).toFixed(2)); }
    return s;
  }

  function jitterText(text, r) {
    var frag = document.createDocumentFragment();
    // split keeping the whitespace tokens
    var parts = text.split(/(\s+)/);
    parts.forEach(function (tok) {
      if (tok === '') return;
      if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
      var w = document.createElement('span');
      w.className = 'w';
      w.style.setProperty('--wy', ((r() * 2 - 1) * 2.6).toFixed(2) + 'px');
      w.style.setProperty('--wr', ((r() * 2 - 1) * 1.6).toFixed(2) + 'deg');
      for (var i = 0; i < tok.length; i++) w.appendChild(charSpan(tok[i], r));
      frag.appendChild(w);
    });
    return frag;
  }

  function walk(node, r) {
    Array.prototype.slice.call(node.childNodes).forEach(function (k) {
      if (k.nodeType === 3) {
        if (!k.nodeValue.trim()) return;
        node.replaceChild(jitterText(k.nodeValue, r), k);
      } else if (k.nodeType === 1 && !k.classList.contains('g') && !k.classList.contains('w')
                 && k.tagName !== 'BR' && k.tagName !== 'SVG') {
        walk(k, r);
      }
    });
  }

  function render(root) {
    var els = (root || document).querySelectorAll('.hand, .margin, .correction .fix');
    Array.prototype.forEach.call(els, function (el) {
      if (el._hw) return; el._hw = true;
      walk(el, rng(hash(el.textContent)));
    });
  }
  return { render: render };
})();
