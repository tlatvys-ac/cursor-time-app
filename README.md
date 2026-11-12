# cursor-time-app

Download page for **Cursor Time** (animatable vector cursors for After
Effects), served by GitHub Pages at
https://tlatvys-ac.github.io/cursor-time-app/. Releases on this repo carry
the download: `CursorTime_v<v>.zxp`, one file for Mac and Windows. It's
built in the private CursorTime repo by `build/package-release.sh`.

Built to the shared download-site rules (reference:
`refractlab-app/index.html`).

## Images

- `logo.svg` / `favicon.svg`: the panel's own logo (a clock whose minute
  hand is a cursor), from `CursorTime/ae-extension/client/logo.svg`. The
  PNG icons are Chrome renders of it.
- Everything else is rendered from the REAL panel and library art (the
  CursorTime checkout next to this one), with neutral sample content. The
  recipe is in `tools/shots/`:
  1. From `~/Documents/GitHub`: `python3 -m http.server 7498 --bind 127.0.0.1`
  2. Headless Chrome: `--headless=new --remote-debugging-port=9411`
  3. `cd tools/shots` and run:
     - hero loop: `node render.mjs hero 756 420 /tmp/frames --frames 30`, then
       `ffmpeg -framerate 30 -i /tmp/frames/f%04d.png -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p -movflags +faststart -an hero.mp4`;
       the poster is frame 105 (the "Get started" click)
     - panel tiles: `DPR=2.5 node render.mjs library|details|colors 328 600 out.png`
     - all states: `DPR=2 node render.mjs states 1080 702 out.png`
     - share image: `DPR=1 node render.mjs og 1200 630 out.png` (JPEG q85)
     - icons: `TRANSPARENT=1 DPR=1 node render.mjs icon 32 32 favicon-32.png` (and 64);
       `DPR=1 node render.mjs "icon&bg=%23181b20&pad=14" 180 180 apple-touch-icon.png`
- Encoding: `avifenc -q 75 -s 4 -y 420 --cicp 1/13/1 -r full`, plus the
  lossless PNG as the fallback (smaller than JPEG q85 for these).
