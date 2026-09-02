# AnchorPoint

a place to set something down.

---

## Test / dev commands

Add `?dev` to any page URL to get a small panel in the corner. Console helpers are also always available.

### Layer 1 — `index.html?dev`
Panel buttons: **dream · normal · eyes · palette · reset**

| console | effect |
|---|---|
| `AP.dream()` | force the next load to render as **DreamScape** (sets the cadence, reloads) |
| `AP.normal()` | reset the cadence to a normal load |
| `AP.eyes()` | trigger the 1-in-100 eyes takeover now (needs `img/eyes.png`) |
| `AP.palette()` | toggle the 1-in-100 green-accent drift |
| `AP.reset()` | wipe **all** AnchorPoint + Ledger localStorage and reload |
| `AP.state()` | `{ pos, gap, dreaming }` for the reload cadence |

Cadence: 7–10 normal loads, then 2 shown as "DreamScape", repeat.

### Layer 2 — any `ledger/*.html?dev`
Panel buttons: **open network · open doctor · open wash-notes · reset**

| console | effect |
|---|---|
| `LG.unlock('p256')` | unseal The Network |
| `LG.unlock('p301')` | unseal The Doctor |
| `LG.unlock('p131')` | unseal the Wash working notes |
| `LG` reset (panel) | wipe Ledger localStorage (`lg_seen`, `lg_found`, `lg_unlocked`, `lg_opened`) and reload |
| `LG.PAGES` | the page graph |

### localStorage keys

`ap_pos` `ap_gap` `ap_lastMessage` · `st_visits` `st_seenDark` `st_seenLight` · `lg_seen` `lg_found` `lg_unlocked` `lg_opened`

Full wipe from `index.html` console: `AP.reset()`.

---

## Map

**Layer 1 (AnchorPoint):** `index.html` → `still.html` → `feed.html` → `notcrazy.html` → `ledger/`
**Layer 2 (The Ledger):** loose leaves, non-linear. Enter at `ledger/` (= p.9). Sealed pages: p.131, p.256 (behind p.47), p.301 (email stage).

`call-sim.html` — the simulated outgoing call, reached from the discreet number in the `index.html` footer.
