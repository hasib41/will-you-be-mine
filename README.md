# Will you be mine? 🐾

A tiny, playful one-page toy: a very small, very serious cat asks you to be
its person. The **No** button is impossible — it flees on hover, tap, and
keyboard, escalating its plea each time, while **Yes** swells until you give
in and the hearts burst. 💕😻

**Live demo:** https://hasib41.github.io/will-you-be-mine/

![Will you be mine?](favicon.png)

## Run it

It's plain HTML/CSS/JS — no build step, no dependencies. Either:

```bash
# open directly
open index.html

# …or serve it (nicer, lets the videos autoplay reliably)
python3 -m http.server 8000   # then visit http://localhost:8000
```

## How it works

- **`index.html`** — the card: two muted looping `<video>`s (an "ask" cat and a
  "yes" cat), the question, and the Yes/No buttons.
- **`style.css`** — design tokens, the card, and the button motion. The No
  button dodges with independent `translate`/`scale` so it can be measured
  transform-free and never flees off-screen.
- **`script.js`** — the escalation arc, the on-screen-safe dodge, the win state
  (cat swap + heart burst), tiny Web-Audio blips, and a reduced-motion path.

Built for accessibility: `prefers-reduced-motion` aware, keyboard-operable,
`aria-live` question, and a sound toggle.

## Credits

- Cat clips: cute-cat memes, converted to lightweight muted MP4.
- Display font: [Comic Relief](https://fonts.google.com/specimen/Comic+Relief) via Google Fonts.

## License

[MIT](LICENSE) — do whatever you like; a link back is appreciated.
