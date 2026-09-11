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
     position in the 4x4 block is set by horizontal ticks: none / upper / lower /
     both == 1/2/3/4 along an axis. Sides are FIXED, they never swap — the column
     axis always ticks off the RIGHT of the stroke, the row axis always off the
     LEFT. What swaps between blocks is which axis is the "anchor": in block 1
     the column axis is the anchor (its upper mark sits at the very top end of
     the stroke, its lower mark at the vertical midpoint between the row axis's
     two fixed marks); in block 2 the row axis is the anchor instead (its lower
     mark at the very bottom end, its upper mark at that same midpoint). The
     non-anchor axis in either block just keeps the two old fixed heights.
     Block 2 also fills its 16 cells BACKWARDS from the last one — Q sits where
     block 1's own reading would have ended (row 3, col 3), R one cell back from
     that, and so on — so the six unused "*" slots land at block 2's own start
     (row 0, and row 1's first two), not its end.
     So A = stroke + ball at the bottom, no ticks (row 0, col 0, both axes at 0).
   Diacritics (ball both ends = umlaut; ball as a hooked line = cedilla;
   ball struck through = circumflex/hacek) are NOT drawn here — real font only.

   MILIGLOSSAS is NOT a cipher. It is a different language with its own script;
   it cannot be letter-swapped back to English. mili() only makes text LOOK
   foreign and is deterministic per string. There is deliberately no decoder. */
window.CIPHER = (function () {

  // ---- Wash: structurally-correct placeholder ----
  function washCell(i) {                 // i: 0..25 -> {block,row,col}
    if (i < 16) return { block: 0, row: (i / 4) | 0, col: i % 4 };
    var within = 31 - i;                 // block 2 reads backward from its last cell
    return { block: 1, row: (within / 4) | 0, col: within % 4 };
  }
  // non-anchor axis: unchanged, the two original fixed heights
  function ticksFixed(n, dir) {
    var out = '';
    if (n === 1 || n === 3) out += '<line x1="11" y1="10" x2="' + (11 + dir * 6) + '" y2="10"/>';
    if (n === 2 || n === 3) out += '<line x1="11" y1="20" x2="' + (11 + dir * 6) + '" y2="20"/>';
    return out;
  }
  // block-1 anchor axis (column): upper mark -> top end of the stroke, lower -> midpoint
  function ticksAnchorTop(n, dir) {
    var out = '';
    if (n === 1 || n === 3) out += '<line x1="11" y1="6"  x2="' + (11 + dir * 6) + '" y2="6"/>';
    if (n === 2 || n === 3) out += '<line x1="11" y1="15" x2="' + (11 + dir * 6) + '" y2="15"/>';
    return out;
  }
  // block-2 anchor axis (row): lower mark -> bottom end of the stroke, upper -> midpoint
  function ticksAnchorBottom(n, dir) {
    var out = '';
    if (n === 1 || n === 3) out += '<line x1="11" y1="15" x2="' + (11 + dir * 6) + '" y2="15"/>';
    if (n === 2 || n === 3) out += '<line x1="11" y1="24" x2="' + (11 + dir * 6) + '" y2="24"/>';
    return out;
  }
  function wash(ch) {
    var c = ch.toLowerCase();
    if (c === ' ') return '<span class="gsp"></span>';
    var i = c.charCodeAt(0) - 97;
    if (i < 0 || i > 25) return '';
    var cell = washCell(i);
    var ballBottom = cell.block === 0;
    var colTicks, rowTicks;                // column: always right (dir +1). row: always left (dir -1)
    if (cell.block === 0) {
      colTicks = ticksAnchorTop(cell.col, 1);
      rowTicks = ticksFixed(cell.row, -1);
    } else {
      colTicks = ticksFixed(cell.col, 1);
      rowTicks = ticksAnchorBottom(cell.row, -1);
    }
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
