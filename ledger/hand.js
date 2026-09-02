/* THE LEDGER — handwriting realism.
   A web font alone can't look hand-written: every "a" is identical. This splits
   marked text into per-character spans and gives each a small, DETERMINISTIC
   (seeded by the text) offset in rotation, baseline and size, plus the odd
   pressed-hard or run-dry stroke. Font is Caveat (contextual alternates on),
   which already varies doubled letters; the jitter does the rest. */
window.HAND = (function () {
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }

  function jitterText(text, r) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === ' ' || ch === '\n' || ch === '\t') { frag.appendChild(document.createTextNode(ch)); continue; }
      var s = document.createElement('span');
      s.className = 'g';
      s.textContent = ch;
      s.style.setProperty('--r', ((r() * 2 - 1) * 2.7).toFixed(2) + 'deg');
      s.style.setProperty('--y', ((r() * 2 - 1) * 1.8).toFixed(2) + 'px');
      s.style.setProperty('--s', (0.93 + r() * 0.14).toFixed(3));
      var p = r();
      if (p < 0.09) { s.style.setProperty('--w', '700'); s.style.setProperty('--o', '1'); }
      else if (p > 0.93) { s.style.setProperty('--o', '.5'); }
      frag.appendChild(s);
    }
    return frag;
  }

  function walk(node, r) {
    Array.prototype.slice.call(node.childNodes).forEach(function (k) {
      if (k.nodeType === 3) {
        if (!k.nodeValue.trim()) return;
        node.replaceChild(jitterText(k.nodeValue, r), k);
      } else if (k.nodeType === 1 && !k.classList.contains('g') && k.tagName !== 'BR' && k.tagName !== 'SVG') {
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
