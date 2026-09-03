/* THE LEDGER — the Mano cipher (a repeating hand-puzzle).

   The Author leaves runs of pointing hands in the margins. Each hand walks the
   cursor one cell on a printed 5x6 letter grid; a closed fist takes the letter
   under the cursor. The cursor starts on A and carries between notes on the
   same page. Edges wrap.

       A B C D E        R = one cell right   ☞
       F G H I J        L = one cell left    ☜
       K L M N O        U = one cell up      ☝
       P Q R S T        D = one cell down    ☟
       U V W X Y        take the letter      ✊
       Z . & ? -

   Solvable by hand with the grid printed on one page (MANO.gridHTML()).
   Repeat it across pages: each margin run decodes to a fragment; the
   fragments together give the word. Placement + what it spells: Max.  */
var MANO = (function () {
  var COLS = 5, ROWS = 6;
  var GRID = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.&?-";        // GRID[r*COLS + c]
  var R = '☞', L = '☜', U = '☝', D = '☟', FIST = '✊';

  function wrap(n, size) { return ((n % size) + size) % size; }
  function letterAt(r, c) { return GRID[wrap(r, ROWS) * COLS + wrap(c, COLS)]; }
  function cellOf(ch) {
    var i = GRID.indexOf(String(ch).toUpperCase());
    return i < 0 ? null : { r: (i / COLS) | 0, c: i % COLS };
  }
  function shortest(target, cur, size) {          // signed cells, shorter way round
    var f = wrap(target - cur, size);
    return f <= size - f ? f : f - size;
  }

  function encode(text) {
    var cur = { r: 0, c: 0 }, out = [];
    text = String(text).toUpperCase();
    for (var k = 0; k < text.length; k++) {
      var t = cellOf(text[k]); if (!t) continue;
      var dc = shortest(t.c, cur.c, COLS), dr = shortest(t.r, cur.r, ROWS), s = '';
      for (var i = 0; i < Math.abs(dc); i++) s += (dc > 0 ? R : L);
      for (var j = 0; j < Math.abs(dr); j++) s += (dr > 0 ? D : U);
      out.push(s + FIST);
      cur = t;
    }
    return out.join('  ');
  }

  function decode(str) {
    var cur = { r: 0, c: 0 }, word = '';
    str = String(str);
    for (var k = 0; k < str.length; k++) {
      var ch = str[k];
      if (ch === R) cur.c++;
      else if (ch === L) cur.c--;
      else if (ch === U) cur.r--;
      else if (ch === D) cur.r++;
      else if (ch === FIST) word += letterAt(cur.r, cur.c);
    }
    return word;
  }

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  // inline markup for a margin note — glyphs jittered like a tired hand
  function render(text) {
    var g = encode(text), h = hash(String(text)), out = '<span class="mano">';
    for (var i = 0; i < g.length; i++) {
      if (g[i] === ' ') { out += '<span class="mano-gap"></span>'; continue; }
      var rot = ((h + i * 53) % 15) - 7;
      out += '<span style="display:inline-block;transform:rotate(' + rot + 'deg)">' + g[i] + '</span>';
    }
    return out + '</span>';
  }

  // the key, for whichever page prints it
  function gridHTML() {
    var out = '<table class="mano-key"><tbody>';
    for (var r = 0; r < ROWS; r++) {
      out += '<tr>';
      for (var c = 0; c < COLS; c++) out += '<td>' + GRID[r * COLS + c] + '</td>';
      out += '</tr>';
    }
    return out + '</tbody></table>';
  }

  return { encode: encode, decode: decode, render: render, gridHTML: gridHTML,
           GRID: GRID, GLYPHS: { R: R, L: L, U: U, D: D, FIST: FIST } };
})();
if (typeof window !== 'undefined') window.MANO = MANO;
if (typeof module !== 'undefined' && module.exports) module.exports = MANO;
