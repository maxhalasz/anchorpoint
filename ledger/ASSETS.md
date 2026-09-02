# The Ledger — texture & collage assets

Drop the PNGs at these exact paths and the CSS takes over automatically
(until a file exists, the procedural grain underneath carries the look).
All paths are relative to the repo root.

## Surfaces / paper stocks  →  `img/tex/`

| file | slot / how used | your reference |
|---|---|---|
| `paper-default.png` | `--tex-paper` — every leaf by default | *Default Page Scan* |
| `paper-stained.png` | `<article class="leaf" data-stock="stained">` | *Old Stained Scan* |
| `paper-ragged.png` | `data-stock="ragged"` (also masks `.frag.torn`) | *Ragged Page Scan* |
| `paper-tissue.png` | `data-stock="tissue"` | *Paper-Tissue Downwards Spiral* |
| `photocopy-black.png` | `data-stock="black"` — dark register for the DRE transcripts / p.61 | *Black Paper Photocopy Noise Scan* |
| `bg-wrong.png` | `data-stock="wrong"` — the disturbing leaves | *Fucked up background weird shit* |
| `paper-bleedthrough.png` | `<article class="leaf bleed">` — ghost text through the page | *Old Paper Scan w Some Text over it* |
| `desk.png` | `--tex-desk` — the surface everything sits on. **Darker + lit** per your note; the CSS already lays a warm light-pool + hard vignette over it | *Table (Make Darker …)* / *Wood Texture* |

## Attachments  →  `img/tex/`

| file | slot | your reference |
|---|---|---|
| `tape-strip.png` | `--tex-tape` — every `.tape` and `.collage .strip` | *Two White Tapes* / *Tape Overlay 2 Thicc* |
| `tape-cross.png` | `--tex-tape-x` — `<span class="tape x">` corner holds | *Cross Duct Tape* / *AnotherCrossDuctTape* |
| `stain-1.png` | `--tex-stain` — `<span class="stain">`; also feeds `.leaf::after` | coffee splatter (transparent) |
| `stain-ring.png` | `--tex-stain-ring` — `<span class="stain ring">` | coffee ring (transparent) |
| `stain-2.png` … `stain-6.png` | drop more and I'll rotate them per leaf | the extra washes / drips / splatters you sent |
| `black-drip.png` | dark drip overlay for `data-stock="black"` leaves | black photocopy drip |

## References (study, not assets)  →  `img/ref/` or anywhere named `Reference_…`

These shape the visual system; they don't get dropped into the page.
- *Bill Cipher journal page* — the Journal-3 register: charcoal + red hand-lettering over faded type, blood spatter, cipher glyphs down the margin. → the **scrawl leaves**.
- *SCP-style "СВОДКА / Мамалыга"* — formal field-report layout: org sigil, typed header, a photo column down the right, a red round seal, footer warning. → **p.61 and any DRE/SERP document leaf**.
- *aged newspaper "LONDON AND COUNTY BANKING COMPANY"* + wine/blood spatter → **the money clippings (p.89, p.90, p.358 front page)**.
- *"how much of your body is your body"* (Kruger-style, black redaction boxes on a body) → **redaction + the Mislaid register**.
- *"DO I EXIST? / DO YOU EXIST?"* (repeated handwriting on tape + eye photo on black) → **collage-on-black + the Unusual Friend thread**.
- *"MY MUSE WAS A MONSTER / I WAS A PUPPET"* → **the `data-stock="wrong"` leaves**.
- *occult collage (all-seeing eye, Tree of Life, "DOGME ET RITUEL")* → **the-word / Carcosa register, deep in the pile**.

Transparent PNGs for anything that sits *on* the paper (tape, stains, tears).

## Collage  (the "Extra collages" move)

```html
<div class="collage">
  <figure class="frag p1"><img src="img/…"></figure>   <!-- torn photo -->
  <figure class="frag p2"><img src="img/…"></figure>
  <span class="strip"></span>                          <!-- tape over the seam -->
  <div class="scrawl">handwriting running up the tape</div>
  <div class="cap">a caption in red</div>
</div>
```
`.frag.torn` uses `paper-ragged.png` as a mask so a rectangular photo reads as torn.

## Diegetic photos  →  `img/`  (one per handwriting slot, `PHOTO: Max`)

`photo-door.png` · `photo-wall-symbol.png` · `photo-1991.png` · `photo-porch.png`
· `frontpage-sally.png` · optional `rx-aklo.png`, `clip-reporter.png`, `frag-eyes.png`
(*Eyes One time collage* could be `frag-eyes.png`).

## Audio  →  `aud/`

`call.mp3` (or `.ogg`) — low room-tone / static / breath bed for `call-sim.html`.
