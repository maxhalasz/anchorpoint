/* THE LEDGER — non-linear navigation over loose leaves.
   Pages are addressed by number (data-p="p47"). Cross-references resolve to:
     live     -> a page in this stack (navigates)
     sealed   -> a page that exists but is not open yet (slip + hint)
     dangling -> a page not in this stack at all ("it did not come through")
   The stack never states its own size. High, non-contiguous numbers + dangling
   refs do the implying. Prose marked TEXT: Max is placeholder. */
window.LG = (function () {
  var LS; try { LS = window.localStorage; } catch (e) { LS = null; }
  function get(k, d) { try { var v = LS && LS.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { if (LS) LS.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var seen = get('lg_seen', []);
  var found = get('lg_found', []);
  var unlocked = get('lg_unlocked', {});   // p131, p256, p301

  function markSeen(id) { if (seen.indexOf(id) < 0) { seen.push(id); set('lg_seen', seen); } }
  function hasSeen(id) { return seen.indexOf(id) >= 0; }
  function addFound(k) { if (found.indexOf(k) < 0) { found.push(k); set('lg_found', found); } }
  function hasFound(k) { return found.indexOf(k) >= 0; }
  function unlock(id) { unlocked[id] = true; set('lg_unlocked', unlocked); }
  function isUnlocked(id) { return !!unlocked[id]; }
  function normalize(s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim(); }

  // the concealment anomaly's name — the answer to the door on p.47
  var DOOR_ANSWER = 'mislaid';

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
            sealed: function () { return !isUnlocked('p131') && !(hasSeen('p130') && hasFound('goodnight sally')); },
            hint: 'read p.130 first, then you need what he called the key' },
    p188: { f: 'p188.html' },
    p189: { f: 'p189.html' },
    p212: { f: 'p212.html' },
    p213: { f: 'p213.html' },
    p256: { f: 'p256.html', sealed: function () { return !isUnlocked('p256'); }, hint: 'behind the door — p.47' },
    p288: { f: 'p288.html' },
    p301: { f: 'p301.html', sealed: function () { return !isUnlocked('p301'); }, hint: 'he opens this one by letter, not from in here' },
    p377: { f: 'p377.html' }
  };

  function classify(id) {
    var p = PAGES[id];
    if (!p) return { kind: 'dangling' };
    if (p.sealed && p.sealed()) return { kind: 'sealed', hint: p.hint };
    return { kind: 'live', file: p.f };
  }

  var toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:120;' +
        'background:rgba(14,22,10,.94);color:#e7d9b6;font:13px/1.5 "Special Elite",monospace;' +
        'padding:8px 14px;border:1px solid rgba(255,255,255,.14);max-width:80vw;text-align:center';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.style.transition = 'opacity .6s'; toastEl.style.opacity = '0'; }, 3200);
  }

  function wireXrefs(root) {
    (root || document).querySelectorAll('[data-p]').forEach(function (el) {
      if (el._wired) return; el._wired = true;
      var id = el.getAttribute('data-p'), c = classify(id), num = id.slice(1);
      el.classList.add('xref', c.kind);
      if (c.kind === 'live') { el.setAttribute('href', c.file); }
      else {
        el.removeAttribute('href');
        el.addEventListener('click', function (e) {
          e.preventDefault();
          toast(c.kind === 'sealed'
            ? 'p.' + num + ' — sealed. ' + (c.hint || 'not yet.')
            : 'p.' + num + ' — he has one. it did not come through.');
        });
      }
    });
  }

  // the index card
  var SEARCH = {
    'the money': 'p88', 'money': 'p88', 'the flow': 'p88',
    'the octopus': 'p89', 'octopus': 'p89',
    'casolaro': 'p90', 'the reporter': 'p90', 'the bathtub': 'p90',
    'the door': 'p47', 'door': 'p47',
    'mislaid': 'h_door', 'the working': 'h_door',
    'the names': 'p130', 'names': 'p130', '1991': 'p130',
    'the word': 'p44', 'wall': 'p44', 'the mark': 'p44',
    'the dreams': 'p212', 'dreams': 'p212', 'the corridor': 'p212',
    'aklo': 'p288', 'medication': 'p288',
    'the network': 'p256',
    'goodnight sally': 'h_key', 'the key': 'h_key', 'wash': 'h_key',
    'the doctor': 'p301', 'pephal': 'p301', 'ryan pephal': 'p301',
    'nyarlathotep': 'h_backwards',
    'stuck': 'h_stuck', 'help': 'h_stuck', 'lost': 'h_stuck'
  };

  function wireSearch(input, slips) {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = normalize(input.value); input.value = ''; if (!q) return;
      var v = SEARCH[q];
      var el = document.createElement('div'); el.className = 'slip';
      if (v === 'h_stuck') el.innerHTML = 'Every sealed page names what it wants, in the margin. And you can write to him.';
      else if (v === 'h_key') { addFound('goodnight sally'); el.innerHTML = 'that is what he calls the key. it goes with <a data-p="p130">the names</a>.'; }
      else if (v === 'h_door') el.innerHTML = 'the name of the working is written on the door itself, and one line in <a data-p="p130">the names</a> resolves to it.';
      else if (v === 'h_backwards') { unlock('p301'); el.innerHTML = 'do not type that here again. <a data-p="p301">p.301</a>.'; }
      else if (v && PAGES[v]) {
        var c = classify(v);
        if (c.kind === 'live') el.innerHTML = 'he had that. &nbsp;<a href="' + c.f + '">p.' + v.slice(1) + '</a>';
        else if (c.kind === 'sealed') el.innerHTML = 'p.' + v.slice(1) + ' — sealed. ' + (PAGES[v].hint || '');
        else { el.className = 'slip dud'; el.textContent = 'he has one. it did not come through.'; }
      } else { el.className = 'slip dud'; el.textContent = 'he has one. it did not come through.'; }
      slips.insertBefore(el, slips.firstChild);
      wireXrefs(slips);
    });
  }

  function initPage(id) {
    if (id) markSeen(id);
    wireXrefs(document);
    var input = document.querySelector('.indexcard input'), slips = document.querySelector('.indexcard .slips');
    if (input && slips) wireSearch(input, slips);
    if (/[?&]dev\b/.test(location.search)) devPanel();
  }

  function devPanel() {
    var run = function () {
      var p = document.createElement('div');
      p.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:200000;background:#111;color:#9f9;font:11px/1.6 monospace;padding:8px 10px;border:1px solid #3a3';
      p.innerHTML = '<b>LG dev</b><br><button data-a="p256">open network</button> <button data-a="p301">open doctor</button> ' +
        '<button data-a="p131">open wash-notes</button> <button data-a="reset">reset</button>';
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
    markSeen: markSeen, hasSeen: hasSeen, addFound: addFound, hasFound: hasFound,
    unlock: unlock, isUnlocked: isUnlocked, normalize: normalize,
    wireXrefs: wireXrefs, initPage: initPage, toast: toast,
    DOOR_ANSWER: DOOR_ANSWER, PAGES: PAGES
  };
})();
