/* THE LEDGER — shared logic: progress state + the desk "terminal" parser.
   Skeleton content is placeholder. Lines marked TEXT: Max need his words. */
window.LG = (function () {
  var LS; try { LS = window.localStorage; } catch (e) { LS = null; }
  function get(k, d) { try { var v = LS && LS.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { if (LS) LS.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var found = get('lg_found', []);
  var unlocked = get('lg_unlocked', {});   // { door:true, network:true, doctor:true }

  function addFound(k) { if (found.indexOf(k) < 0) { found.push(k); set('lg_found', found); } }
  function unlock(n) { unlocked[n] = true; set('lg_unlocked', unlocked); }
  function isUnlocked(n) { return !!unlocked[n]; }

  function normalize(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
  }

  // door answer — the concealment anomaly's name. TEXT: Max (placeholder)
  var DOOR_ANSWER = 'mislaid';

  // ---- the desk terminal dictionary ----
  // key -> { slip: html, unlock?: entryKey, hint?: true }
  var TERMS = {
    'dre':            { slip: "A name in no index. It was real, it was quiet, and quiet is why no one remembers it." },
    'the choir':      { slip: "Not this. Whatever is under the platform is its own animal. Do not fold the two together." }, // TEXT: Max
    '1991':           { slip: "The year the list is from. By then everyone on it answered to a nickname." },
    'carcosa':        { slip: "A pale marker, planted early. It keeps its claim after the wound closes." },                  // TEXT: Max
    'aklo':           { slip: "The prescription. He thinks it is why the dreams sharpened. He is half right." },
    'the word':       { slip: "You have seen it more often than you counted. Look for the one facing the wrong way." },
    'goodnight sally':{ slip: "<span class='k'>legend</span>Wash Cipher key: a stroke with a ball at each end. Read the Names again with this.", hint: true }, // TEXT: Max
    'mislaid':        { slip: "<span class='k'>the door</span>The name of the thing on the archive door. Type it on that page.", unlock: 'door', hint: true }, // TEXT: Max
    'stuck':          { slip: "<span class='k'>nudge</span>Each sealed page names its own key in the margin. And you can always write to him.", hint: true },
    'malcolm':        { slip: "He does not sign anything. Do not wait for that to change." },
    'nyarlathotep':   { slip: "<span class='k'>—</span>Do not type that here again.", unlock: 'doctor' }  // TEMP unlock for review; real unlock is the email stage
  };

  function wireTerm(input, slips) {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = normalize(input.value);
      input.value = '';
      if (!q) return;
      var hit = TERMS[q];
      var el = document.createElement('div');
      el.className = 'slip' + (hit ? '' : ' dud');
      if (hit) {
        el.innerHTML = hit.slip;
        addFound(q);
        if (hit.unlock) unlock(hit.unlock);
      } else {
        el.textContent = '— nothing on that —';
      }
      slips.insertBefore(el, slips.firstChild);
    });
  }

  // contents page: open/seal tabs by unlock state
  function paintIndex() {
    var tabs = document.querySelectorAll('.tab[data-lock]');
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i], key = tab.getAttribute('data-lock');
      if (isUnlocked(key)) {
        tab.classList.remove('locked');
        if (tab.getAttribute('data-href')) tab.setAttribute('href', tab.getAttribute('data-href'));
        var s = tab.querySelector('.seal'); if (s) s.parentNode.removeChild(s);
      } else {
        tab.classList.add('locked');
        tab.removeAttribute('href');
      }
    }
  }

  return {
    found: found, unlocked: unlocked, addFound: addFound, unlock: unlock, isUnlocked: isUnlocked,
    wireTerm: wireTerm, paintIndex: paintIndex, normalize: normalize, TERMS: TERMS, DOOR_ANSWER: DOOR_ANSWER
  };
})();
