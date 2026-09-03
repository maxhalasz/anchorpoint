/* THE LEDGER — the Mano cipher.

   Base: the TRIFID cipher (Félix Delastelle, 1902 — a fractionating cipher that
   was never fielded but shaped modern crypto).  Hand-form: only the sideways
   and downward pointing hands, no up, no emoji.

     hand value:   left  = 1     ☜  (or the black hand ☚)
                   down  = 2     ☟
                   right = 3     ☞  (or the black hand ☛)

   Each letter is three coordinates (layer, row, column) in a 3x3x3 cube whose
   27 cells are scrambled from a keyword.  The three coordinate streams of a
   whole note are then written out one after another — ALL the layers, THEN all
   the rows, THEN all the columns — so a run of three hands no longer lines up
   with one letter.  To read it you must split the run into three equal parts,
   put layer[i], row[i], column[i] back together, and look each triple up in
   the cube.

     cube, default keyword "THELEDGER" (layer 1 / 2 / 3):
        T H E     A B F     N O P
        L D G     I J K     Q S U
        R C .     M .       V W X ...   (last cell . is filler)

   MANO.setKey("<word>") rebuilds the cube.  Repeat across pages like the Wash
   cipher — each margin note one fractionated block.  Keyword, placement, and
   what it spells: Max.  */
var MANO = (function () {
  var GL = { 1: '☜', 2: '☟', 3: '☞' };            // primary glyphs
  var BLK = { '☜': '☚', '☞': '☛' };               // stylistic swaps, render only
  var VAL = { '☜': 1, '☚': 1, '☟': 2, '☞': 3, '☛': 3 };
  var VS = '︎';                                    // text presentation — never emoji

  function buildCube(keyword) {
    var src = String(keyword).toUpperCase().replace(/[^A-Z]/g, '') + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var seen = {}, s = '';
    for (var i = 0; i < src.length && s.length < 27; i++) {
      if (!seen[src[i]]) { seen[src[i]] = 1; s += src[i]; }
    }
    while (s.length < 27) s += '.';
    return s;
  }
  var _cube = buildCube('THELEDGER');
  function setKey(k) { _cube = buildCube(k); }

  function coords(ch) {                              // letter -> [layer,row,col], each 1..3
    var i = _cube.indexOf(String(ch).toUpperCase());
    if (i < 0) return null;
    return [((i / 9) | 0) + 1, (((i % 9) / 3) | 0) + 1, (i % 3) + 1];
  }
  function letterAt(l, r, c) { return _cube[(l - 1) * 9 + (r - 1) * 3 + (c - 1)]; }
  function clean(text) { return String(text).toUpperCase().replace(/[^A-Z]/g, ''); }

  // plaintext -> fractionated coordinate digits (string of 1/2/3), block = period letters
  function fractionate(text, period) {
    var L = clean(text), out = '';
    period = period || L.length || 1;
    for (var b = 0; b < L.length; b += period) {
      var blk = L.slice(b, b + period), lay = '', row = '', col = '';
      for (var k = 0; k < blk.length; k++) {
        var t = coords(blk[k]); if (!t) continue;
        lay += t[0]; row += t[1]; col += t[2];
      }
      out += lay + row + col;
    }
    return out;
  }
  // fractionated digits -> plaintext
  function defractionate(digits, period) {
    var d = String(digits).replace(/[^123]/g, ''), out = '', total = d.length, pos = 0;
    period = period || (total / 3) || 1;
    while (pos < total) {
      var take = Math.min(3 * period, total - pos), seg = d.substr(pos, take), p = (take / 3) | 0;
      for (var k = 0; k < p; k++) {
        out += letterAt(+seg[k], +seg[p + k], +seg[2 * p + k]);
      }
      pos += take;
    }
    return out;
  }

  function encode(text, period) {
    var dg = fractionate(text, period), s = '';
    for (var i = 0; i < dg.length; i++) {
      s += GL[+dg[i]] + VS;
      if ((i + 1) % 3 === 0) s += '  ';
    }
    return s.trim();
  }
  function decode(run, period) {
    var raw = String(run).replace(/︎/g, '').split(''), d = '';
    for (var i = 0; i < raw.length; i++) if (VAL[raw[i]]) d += VAL[raw[i]];
    return defractionate(d, period);
  }

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  // inline markup for a margin note — a tired hand, some strokes pressed harder (black)
  function render(text, period) {
    var enc = encode(text, period), h = hash(String(text)), out = '<span class="mano">', p = 0;
    for (var i = 0; i < enc.length; i++) {
      var ch = enc[i];
      if (ch === VS) continue;
      if (ch === ' ') { out += '<span class="mano-gap"></span>'; continue; }
      if (BLK[ch] && ((h + i) % 5 === 0)) ch = BLK[ch];        // occasional heavy stroke
      var rot = ((h + i * 53) % 15) - 7;
      out += '<span style="display:inline-block;transform:rotate(' + rot + 'deg)">' + ch + VS + '</span>';
      if (++p % 3 === 0) out += '<span class="mano-tri"></span>';
    }
    return out + '</span>';
  }

  // the cube, for whichever page prints the key
  function cubeHTML() {
    var out = '<div class="mano-key">';
    for (var l = 0; l < 3; l++) {
      out += '<table><caption>' + (GL[l + 1] + VS) + '</caption><tbody>';
      for (var r = 0; r < 3; r++) {
        out += '<tr>';
        for (var c = 0; c < 3; c++) out += '<td>' + _cube[l * 9 + r * 3 + c] + '</td>';
        out += '</tr>';
      }
      out += '</tbody></table>';
    }
    return out + '</div>';
  }

  return {
    encode: encode, decode: decode, render: render, cubeHTML: cubeHTML,
    setKey: setKey, cube: function () { return _cube; },
    HANDS: [GL[1] + VS, GL[2] + VS, GL[3] + VS]
  };
})();
if (typeof window !== 'undefined') window.MANO = MANO;
if (typeof module !== 'undefined' && module.exports) module.exports = MANO;
