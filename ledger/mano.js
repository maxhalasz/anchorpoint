/* THE LEDGER — the Mano cipher (a repeating hand-puzzle).

   Six pointing hands, no emoji (forced to text presentation).  Each letter is
   ONE PAIR of hands: the first hand names a row, the second a column, on a 6x6
   key grid whose letters are scrambled from a keyword.  No walk, no arrow that
   points at the answer — a pair like  (right-hand, left-hand)  means nothing
   without the grid.  Solvable by hand once the grid is printed on a page.

     rows / cols, in order:   U+261A U+261B U+261C U+261D U+261E U+261F
       (black-left, black-right, white-left, white-up, white-right, white-down)

     key grid, default keyword "THELEDGER":
        row/col   ᴬ  ᴮ  ᶜ  ᴰ  ᴱ  ᶠ   <- the six hands
          ᴬ       T  H  E  L  D  G
          ᴮ       R  A  B  C  F  I
          ᶜ       J  K  M  N  O  P
          ᴰ       Q  S  U  V  W  X
          ᴱ       Y  Z  0  1  2  3
          ᶠ       4  5  6  7  8  9

   MANO.setKey("<word>") rebuilds the grid.  Repeat the cipher across pages like
   the Wash cipher — each margin note a fragment.  Placement, the keyword, and
   what it spells: Max.  */
var MANO = (function () {
  var H = ['☚', '☛', '☜', '☝', '☞', '☟']; // black L/R, white L/U/R/D
  var VS = '︎';                          // text-presentation selector: never emoji
  var N = 6;                                  // 6x6 = 36 cells

  function buildGrid(keyword) {
    var src = String(keyword).toUpperCase().replace(/[^A-Z0-9]/g, '') +
              'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var seen = {}, s = '';
    for (var i = 0; i < src.length && s.length < N * N; i++) {
      if (!seen[src[i]]) { seen[src[i]] = 1; s += src[i]; }
    }
    return s;
  }
  var _grid = buildGrid('THELEDGER');
  function setKey(keyword) { _grid = buildGrid(keyword); }

  function encode(text) {
    var out = [];
    text = String(text).toUpperCase();
    for (var k = 0; k < text.length; k++) {
      var i = _grid.indexOf(text[k]);
      if (i < 0) continue;
      out.push(H[(i / N) | 0] + VS + H[i % N] + VS);
    }
    return out.join('  ');
  }
  function decode(run) {
    var s = [];
    var raw = String(run).split('');
    for (var i = 0; i < raw.length; i++) if (H.indexOf(raw[i]) >= 0) s.push(raw[i]);
    var word = '';
    for (var k = 0; k + 1 < s.length; k += 2) {
      word += _grid[H.indexOf(s[k]) * N + H.indexOf(s[k + 1])] || '';
    }
    return word;
  }

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  // inline markup for a margin note — each glyph nudged like a tired hand
  function render(text) {
    var enc = encode(text), out = '<span class="mano">', h = hash(String(text)), p = 0;
    for (var i = 0; i < enc.length; i++) {
      var ch = enc[i];
      if (ch === VS) continue;
      if (ch === ' ') { out += '<span class="mano-gap"></span>'; continue; }
      var rot = ((h + i * 53) % 15) - 7;
      out += '<span style="display:inline-block;transform:rotate(' + rot + 'deg)">' + ch + VS + '</span>';
      if (++p % 2 === 0) out += '<span class="mano-pair"></span>';
    }
    return out + '</span>';
  }

  // the key grid, for whichever page prints it
  function gridHTML() {
    var out = '<table class="mano-key"><tbody><tr><td class="h"></td>';
    for (var c = 0; c < N; c++) out += '<td class="h">' + H[c] + VS + '</td>';
    out += '</tr>';
    for (var r = 0; r < N; r++) {
      out += '<tr><td class="h">' + H[r] + VS + '</td>';
      for (var c2 = 0; c2 < N; c2++) out += '<td>' + _grid[r * N + c2] + '</td>';
      out += '</tr>';
    }
    return out + '</tbody></table>';
  }

  return { encode: encode, decode: decode, render: render, gridHTML: gridHTML,
           setKey: setKey, grid: function () { return _grid; },
           HANDS: H.map(function (g) { return g + VS; }) };   // display-safe (text, not emoji)
})();
if (typeof window !== 'undefined') window.MANO = MANO;
if (typeof module !== 'undefined' && module.exports) module.exports = MANO;
