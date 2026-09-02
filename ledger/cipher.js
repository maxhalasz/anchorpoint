/* THE LEDGER — placeholder cipher glyph renderers.
   @Wash Cipher  = strokes with a ball at each end (angular).
   @Miliglossas  = "thousand tongues" (organic curves + a dot).
   These are systematic stand-ins for Max to redraw/replace. Deterministic per letter. */
window.CIPHER = (function () {
  function rnd(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function wash(ch) {
    var i = ch.toLowerCase().charCodeAt(0) - 97;
    if (i < 0 || i > 25) return ch === ' ' ? '<span class="gsp"></span>' : '';
    var ticks = (i % 4) + 1;
    var strokes = ['<line x1="11" y1="3" x2="11" y2="25"/>'];
    var caps = ['<circle cx="11" cy="3" r="2.6"/>', '<circle cx="11" cy="25" r="2.6"/>'];
    for (var t = 0; t < ticks; t++) {
      var y = 6 + rnd(i * 9 + t) * 15;
      var dir = rnd(i + t * 3) > 0.5 ? 1 : -1;
      var len = 5 + rnd(i * 2 + t) * 4;
      var x2 = 11 + dir * len, y2 = y + (rnd(i * 5 + t) - 0.5) * 6;
      strokes.push('<line x1="11" y1="' + y.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>');
      caps.push('<circle cx="' + x2.toFixed(1) + '" cy="' + y2.toFixed(1) + '" r="2.3"/>');
    }
    return '<svg class="glyph" viewBox="0 0 22 28" width="19" height="24">'
      + '<g stroke="currentColor" stroke-width="2.1" stroke-linecap="round" fill="none">' + strokes.join('') + '</g>'
      + '<g fill="currentColor">' + caps.join('') + '</g></svg>';
  }

  function mili(ch) {
    var i = ch.toLowerCase().charCodeAt(0) - 97;
    if (i < 0 || i > 25) return ch === ' ' ? '<span class="gsp"></span>' : '';
    var a = 4 + rnd(i) * 6, b = 24 - rnd(i * 3) * 6;
    var cx1 = 2 + rnd(i * 7) * 18, cy1 = 4 + rnd(i * 2) * 8;
    var cx2 = 2 + rnd(i * 11) * 18, cy2 = 16 + rnd(i * 5) * 8;
    var d = 'M4 ' + a.toFixed(1) + ' C ' + cx1.toFixed(1) + ' ' + cy1.toFixed(1) + ' '
      + cx2.toFixed(1) + ' ' + cy2.toFixed(1) + ' 18 ' + b.toFixed(1);
    var dot = rnd(i * 13) > 0.5
      ? '<circle cx="' + (2 + rnd(i * 17) * 16).toFixed(1) + '" cy="' + (2 + rnd(i * 19) * 4).toFixed(1) + '" r="1.7"/>' : '';
    return '<svg class="glyph" viewBox="0 0 22 28" width="19" height="24">'
      + '<path d="' + d + '" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<g fill="currentColor">' + dot + '</g></svg>';
  }

  function render(str, style) {
    var f = style === 'mili' ? mili : wash;
    return String(str).split('').map(f).join('');
  }
  return { render: render, wash: wash, mili: mili };
})();
