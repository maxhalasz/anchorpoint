/* THE LEDGER — script renderers.  PLACEHOLDER geometry; Max draws the real fonts.

   WASH CIPHER (a real substitution cipher — Max maintains the table/wiki):
     table, "o" marks the start, read with the word:
        o A B C D          Q R S T
          E F G H          U V W X
          I J K L          Y Z * *
          M N O P          * * * *o
     A vertical stroke + one ball.
       ball at BOTTOM  -> top block  (A..P)
       ball at TOP     -> bottom block (Q..)
     position in the 4x4 block is set by horizontal ticks:
       none / upper-half / lower-half / both  ==  1 / 2 / 3 / 4  along an axis
       one axis for the column, one for the row; the two axes swap sides
       between the blocks (that is the "right/down" vs "left/down" flip).
     So A = stroke + ball at the bottom, no ticks.
   Diacritics (ball both ends = umlaut; ball as a hooked line = cedilla;
   ball struck through = circumflex/hacek) are NOT drawn here — real font only.

   MILIGLOSSAS is NOT a cipher. It is a different language with its own script;
   it cannot be letter-swapped back to English. mili() only makes text LOOK
   foreign and is deterministic per string. There is deliberately no decoder. */
window.CIPHER = (function () {

  // ---- Wash: structurally-correct placeholder ----
  function washCell(i) {                 // i: 0..25 -> {block,row,col}
    var block = i < 16 ? 0 : 1;
    var within = block ? i - 16 : i;
    return { block: block, row: (within / 4) | 0, col: within % 4 };
  }
  function ticks(x, n, flip) {           // n: 0..3  ->  none / upper / lower / both
    var out = '';
    var dir = flip ? -1 : 1;
    if (n === 1 || n === 3) out += '<line x1="11" y1="10" x2="' + (11 + dir * 6) + '" y2="10"/>';
    if (n === 2 || n === 3) out += '<line x1="11" y1="20" x2="' + (11 + dir * 6) + '" y2="20"/>';
    return out;
  }
  function wash(ch) {
    var c = ch.toLowerCase();
    if (c === ' ') return '<span class="gsp"></span>';
    var i = c.charCodeAt(0) - 97;
    if (i < 0 || i > 25) return '';
    var cell = washCell(i);
    var ballBottom = cell.block === 0;
    var colTicks = ticks(11, cell.col, cell.block === 1);   // column axis, swaps side per block
    var rowTicks = ticks(11, cell.row, cell.block === 0);   // row axis, other side
    return '<svg class="glyph" viewBox="0 0 22 30" width="18" height="24">'
      + '<g stroke="currentColor" stroke-width="2.1" stroke-linecap="round" fill="none">'
      + '<line x1="11" y1="4" x2="11" y2="26"/>' + colTicks + rowTicks + '</g>'
      + '<circle cx="11" cy="' + (ballBottom ? 26 : 4) + '" r="2.7" fill="currentColor"/></svg>';
  }
  function washStart() {                 // the "o" marker that opens a word
    return '<svg class="glyph" viewBox="0 0 14 30" width="12" height="24"><circle cx="7" cy="15" r="4.4" '
      + 'stroke="currentColor" stroke-width="2" fill="none"/></svg>';
  }
  function washWord(str) {
    return washStart() + String(str).split('').map(wash).join('');
  }

  // ---- Miliglossas: a foreign script, not a cipher ----
  var FORMS = [
    'M3 20 C 6 4 14 6 12 20 S 19 8 19 22',
    'M4 6 C 12 10 4 18 14 22 M14 6 C 6 12 16 16 8 24',
    'M11 4 C 2 12 20 16 11 26 M11 15 h 8',
    'M4 24 C 8 6 16 6 18 22 M6 14 q 6 -8 12 0',
    'M4 8 q 8 14 0 18 M18 8 q -8 14 0 18',
    'M11 4 v 22 M6 9 q 5 4 10 0 M6 19 q 5 4 10 0',
    'M3 15 q 8 -12 16 0 q -8 12 -16 0 M11 8 v 14',
    'M5 5 C 18 8 4 16 16 24 M12 5 v 20'
  ];
  function h(seed) { var x = Math.sin(seed * 91.7 + 47.3) * 43758.5; return x - Math.floor(x); }
  function mili(ch, ix) {
    if (ch === ' ') return '<span class="gsp"></span>';
    var k = (ch.toLowerCase().charCodeAt(0) * 7 + ix * 13) % FORMS.length;
    var rot = (h(ch.charCodeAt(0) + ix) - 0.5) * 10;
    return '<svg class="glyph" viewBox="0 0 22 30" width="17" height="23" style="transform:rotate(' + rot.toFixed(1) + 'deg)">'
      + '<path d="' + FORMS[k] + '" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  }
  function miliText(str) { return String(str).split('').map(function (c, i) { return mili(c, i); }).join(''); }

  return { wash: wash, washWord: washWord, washStart: washStart, miliText: miliText };
})();
