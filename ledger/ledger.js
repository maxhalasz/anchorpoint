/* THE LEDGER — non-linear navigation over loose leaves.
   Pages are addressed by number (data-p="p47"). Cross-references resolve to:
     live     -> a page in this stack (navigates)
     sealed   -> a page that exists but is not open yet
     dangling -> a page not in this stack at all ("it did not come through")
   A sealed page opens when you have SEEN the pages that add up to it — not by
   typing a keyword. The index card is a lookup, not a solver: it only points.
   The stack never states its own size. Prose marked TEXT: Max is placeholder. */
window.LG = (function () {
  var LS; try { LS = window.localStorage; } catch (e) { LS = null; }
  function get(k, d) { try { var v = LS && LS.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { if (LS) LS.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var seen = get('lg_seen', []);
  var found = get('lg_found', []);
  var unlocked = get('lg_unlocked', {});   // p256 (door), p301 (email)

  function markSeen(id) { if (id && seen.indexOf(id) < 0) { seen.push(id); set('lg_seen', seen); } }
  function hasSeen(id) { return seen.indexOf(id) >= 0; }
  function addFound(k) { if (found.indexOf(k) < 0) { found.push(k); set('lg_found', found); } }
  function unlock(id) { unlocked[id] = true; set('lg_unlocked', unlocked); }
  function isUnlocked(id) { return !!unlocked[id]; }
  function normalize(s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim(); }

  var DOOR_ANSWER = 'mislaid';   // the concealment anomaly on p.47. TEXT: Max

  // sealed pages open on a SEEN-SET, so it lands as a realisation, not a lookup
  var PAGES = {
    p5:   { f: 'p5.html' },
    p9:   { f: 'index.html' },
    p44:  { f: 'p44.html' },
    p47:  { f: 'p47.html' },
    p61:  { f: 'p61.html' },
    p88:  { f: 'p88.html' },
    p89:  { f: 'p89.html' },
    p90:  { f: 'p90.html' },
    p130: { f: 'p130.html' },
    p131: { f: 'p131.html',
            sealed: function () { return !(hasSeen('p130') && (hasSeen('p188') || hasSeen('p189'))); },
            open_when: 'you have read the names and the test' },
    p188: { f: 'p188.html' },
    p189: { f: 'p189.html' },
    p212: { f: 'p212.html' },
    p213: { f: 'p213.html',
            sealed: function () { return !(hasSeen('p212') && hasSeen('p288')); },
            open_when: 'you have read the corridor and the medication' },
    p256: { f: 'p256.html', sealed: function () { return !isUnlocked('p256'); },
            open_when: 'the door on p.47 is named' },
    p288: { f: 'p288.html' },
    p301: { f: 'p301.html', sealed: function () { return !isUnlocked('p301'); },
            open_when: 'he opens this one by letter' },
    p377: { f: 'p377.html',
            sealed: function () { return !(hasSeen('p256') && hasSeen('p301')); },
            open_when: 'you have read the network and the doctor' }
  };

  function classify(id) {
    var p = PAGES[id];
    if (!p) return { kind: 'dangling' };
    if (p.sealed && p.sealed()) return { kind: 'sealed', why: p.open_when };
    return { kind: 'live', file: p.f };
  }

  var toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:120;' +
        'background:rgba(7,13,5,.95);color:#e7d9b6;font:13px/1.5 "Special Elite",monospace;' +
        'padding:9px 15px;border:1px solid rgba(255,255,255,.14);max-width:80vw;text-align:center';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1'; toastEl.style.transition = 'none';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.style.transition = 'opacity .7s'; toastEl.style.opacity = '0'; }, 3600);
  }

  function wireXrefs(root) {
    (root || document).querySelectorAll('[data-p]').forEach(function (el) {
      if (el._wired) return; el._wired = true;
      var id = el.getAttribute('data-p'), c = classify(id), num = id.slice(1);
      el.classList.remove('live', 'sealed', 'dangling');
      el.classList.add('xref', c.kind);
      if (c.kind === 'live') { el.setAttribute('href', c.file); }
      else {
        el.removeAttribute('href');
        el.addEventListener('click', function (e) {
          e.preventDefault();
          toast(c.kind === 'sealed'
            ? 'p.' + num + ' is still sealed — it opens once ' + (c.why || 'more of the stack lines up') + '.'
            : 'p.' + num + ' — he has one. it did not come through.');
        });
      }
    });
  }

  // index card: pure lookup. word -> where it is. never an answer, never an unlock.
  var SEARCH = {
    'the money': 'p88', 'money': 'p88', 'the flow': 'p88',
    'the octopus': 'p89', 'octopus': 'p89',
    'casolaro': 'p90', 'the reporter': 'p90', 'the bathtub': 'p90',
    'the door': 'p47', 'door': 'p47',
    'the names': 'p130', 'names': 'p130', '1991': 'p130',
    'the word': 'p44', 'wall': 'p44', 'the mark': 'p44',
    'the corridor': 'p212', 'the dreams': 'p212', 'dreams': 'p212',
    'aklo': 'p288', 'medication': 'p288',
    'the network': 'p256',
    'the key': 'p131', 'wash': 'p131', 'the cipher': 'p131',
    'the test': 'p188', 'the experiment': 'p188',
    'the doctor': 'p301', 'pephal': 'p301', 'ryan pephal': 'p301',
    'trauma': 'p5'
  };

  function wireSearch(input, slips) {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = normalize(input.value); input.value = ''; if (!q) return;
      var v = SEARCH[q];
      var el = document.createElement('div'); el.className = 'slip';
      if (v && PAGES[v]) {
        var c = classify(v), n = v.slice(1);
        if (c.kind === 'live') el.innerHTML = 'p.' + n + ' &mdash; <a data-p="' + v + '">go</a>';
        else el.innerHTML = 'p.' + n + ' &mdash; he has it, still sealed.';
      } else { el.className = 'slip dud'; el.textContent = 'he has one. it did not come through.'; }
      slips.insertBefore(el, slips.firstChild);
      wireXrefs(slips);
    });
  }

  // little strip of the page numbers you have pulled so far — gaps do the implying
  function paintPulled(host) {
    if (!host) return;
    var nums = seen.filter(function (s) { return /^p\d+$/.test(s); })
      .map(function (s) { return parseInt(s.slice(1), 10); }).sort(function (a, b) { return a - b; });
    if (!nums.length) return;
    host.textContent = 'pulled  ' + nums.map(function (n) { return 'p.' + n; }).join('   ');
  }

  function initPage(id) {
    var wasSealed = {};
    Object.keys(PAGES).forEach(function (k) { var p = PAGES[k]; wasSealed[k] = !!(p.sealed && p.sealed()); });
    markSeen(id);
    // did visiting this page just unseal something?
    Object.keys(PAGES).forEach(function (k) {
      var p = PAGES[k];
      if (wasSealed[k] && p.sealed && !p.sealed()) {
        setTimeout(function () { toast('p.' + k.slice(1) + ' just came unsealed.'); }, 500);
      }
    });
    wireXrefs(document);
    var input = document.querySelector('.indexcard input'), slips = document.querySelector('.indexcard .slips');
    if (input && slips) wireSearch(input, slips);
    paintPulled(document.querySelector('.indexcard .pulled'));
    if (/[?&]dev\b/.test(location.search)) devPanel();
  }

  function devPanel() {
    var run = function () {
      var p = document.createElement('div');
      p.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:200000;background:#111;color:#9f9;font:11px/1.6 monospace;padding:8px 10px;border:1px solid #3a3';
      p.innerHTML = '<b>LG dev</b><br><button data-a="p256">open network</button> <button data-a="p301">open doctor</button> ' +
        '<button data-a="reset">reset</button>';
      p.addEventListener('click', function (e) {
        var a = e.target.getAttribute('data-a');
        if (a === 'reset') { try { ['lg_seen', 'lg_found', 'lg_unlocked', 'lg_opened'].forEach(function (k) { LS.removeItem(k); }); } catch (x) {} location.reload(); }
        else if (a) { unlock(a); location.reload(); }
      });
      document.body.appendChild(p);
    };
    if (document.body) run(); else document.addEventListener('DOMContentLoaded', run);
  }

  return {
    seen: seen, found: found, unlocked: unlocked,
    markSeen: markSeen, hasSeen: hasSeen, addFound: addFound,
    unlock: unlock, isUnlocked: isUnlocked, normalize: normalize,
    wireXrefs: wireXrefs, initPage: initPage, toast: toast,
    DOOR_ANSWER: DOOR_ANSWER, PAGES: PAGES
  };
})();
