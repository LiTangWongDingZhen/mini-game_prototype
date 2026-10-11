# mini-game_prototype

A **COMP5241 mini-game prototype site** — one deployable static site made of three
self-contained pieces:

| Piece | Path | What it is |
| --- | --- | --- |
| 🏠 Landing page | `index.html` | Static front page that links to everything below |
| ⛏️ **Gold Rush Hook** | [`gold_hook/`](./gold_hook) | A Gold Miner–style **SDLC learning game** (Next.js 15 + Canvas 2D + Zustand) |
| 🍺 Testers & the Bar | [`bar_animation/`](./bar_animation) | A 23-scene **animated SVG story** (single HTML file) |
| 🪶 Whip demo | [`state your requirements clearly/`](./state%20your%20requirements%20clearly) | Two HTML interpretations of one prompt — a lesson in **prompt precision** |

Each piece is independent and has its own `agents.md` / `AGENTS.md` and (for the
game) a full `README.md`. This file is the project-level overview.

---

## The game in one line

> **Hook the DO's of the SDLC for marks, dodge the DON'Ts.**

A Gold Miner–style browser game where the **DO's of the Software Development
Lifecycle are the gold** (hook one → earn marks) and the **DON'Ts are the rocks**
(hook one → lose marks). Every object carries its lesson as a label
(e.g. `Run unit tests ✓`, `Skip testing ✗`). Three levels, a between-level shop
with four upgrades, `localStorage` saves, and fully synthesised Web Audio SFX.
100 % client-side — no server, no database, no game engine.

Full details: [`gold_hook/README.md`](./gold_hook/README.md) and
[`gold_hook/AGENTS.md`](./gold_hook/AGENTS.md).

---

## The prompt-precision lesson

The `state your requirements clearly/` folder demonstrates why **concise,
unambiguous prompts matter** when working with agents. One prompt was given to an
agent:

> 寫一個html程式，內容是一個動態svg：一個自行車騎著人往前走，然後後面有個鵜鶘拿鞭子抽他，人要有受擊反饋。

- **`origin whip/origin whip.html`** — the agent's **first** interpretation of the
  whole prompt.
- **`polyu-style/whip_pelican.html`** — the result after the specific phrase
  **「一個自行車騎著人往前走」** was re-prompted on top of the first result.

Compare the two to see how re-stating a single phrase changes the output. The
landing page's **"Prompt precision lesson"** section links both.

---

## Run it locally

### Whole site (what the deployment runs)

```bash
npm run build        # installs + builds the game, assembles everything into dist/
```

Then open `dist/index.html` in a browser, or serve the folder:

```bash
npx serve dist       # or: python -m http.server --directory dist
```

### Game only (dev server)

```bash
cd gold_hook
npm install
npm run dev          # http://localhost:3000
```

### Demos

Open the `.html` files directly in any modern browser (Chrome / Edge) — no build
step:

- `bar_animation/testers-bar-polyu.html`
- `state your requirements clearly/origin whip/origin whip.html`
- `state your requirements clearly/polyu-style/whip_pelican.html`

---

## Deploy to Vercel

The site is deployed as **plain static files** — there is no server at runtime.

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Vercel reads [`vercel.json`](./vercel.json):
   - `buildCommand`: `npm run build`
   - `outputDirectory`: `dist`
4. Deploy. The result is served as:
   - `/` — landing page
   - `/gold_hook/` — the game
   - `/bar_animation/testers-bar-polyu.html` — the bar story
   - `/state your requirements clearly/...` — the whip demo

### How the build works

[`build.mjs`](./build.mjs) (run by `npm run build`) does three things:

1. Installs + builds the Next.js game as a **static export**
   (`output: "export"`, `basePath: "/gold_hook"` in
   [`gold_hook/next.config.mjs`](./gold_hook/next.config.mjs)) → `gold_hook/out/`.
2. Copies `index.html` → `dist/index.html`.
3. Copies `gold_hook/out/` → `dist/gold_hook/`, plus the two demo folders, into
   `dist/`.

Because the game is exported with `basePath: "/gold_hook"`, its HTML references
`/gold_hook/_next/...`, which resolves correctly when `out/` is placed at
`dist/gold_hook/`. All cross-page links in `index.html` are **relative**, so the
site works from any host.

---

## Repository layout

```
.
├── index.html                          # landing page (static, links to everything)
├── build.mjs                           # root build: game export + assemble dist/
├── package.json                        # root scripts (build, typecheck)
├── vercel.json                         # Vercel: buildCommand + outputDirectory
├── .gitignore                          # ignores dist/, node_modules/, build artifacts
├── agents.md                           # agent guidance for the whole repo
├── README.md                           # this file
├── gold_hook/                          # the game (Next.js) — see gold_hook/AGENTS.md
│   ├── app/                            #   layout, page, globals.css
│   ├── components/                     #   GameShell, GameCanvas, HUD, screens, shop
│   └── lib/                            #   store + game logic (hook, levels, catalog…)
├── bar_animation/                      # animated SVG story — see bar_animation/agents.md
│   └── testers-bar-polyu.html
└── state your requirements clearly/    # whip demo — two interpretations
    ├── origin whip/
    │   └── origin whip.html
    └── polyu-style/
        └── whip_pelican.html
```

---

## Tech stack

- **Game:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Canvas 2D ·
  Zustand · Web Audio API
- **Landing page & demos:** plain HTML + CSS + inline SVG (no frameworks)
- **Deployment:** static export → `dist/` → Vercel

---

## Conventions for contributors

- Keep the three pieces **independent** — a change to one shouldn't require
  touching the others.
- Keep all cross-page links in `index.html` **relative** (never hard-code
  `localhost` as a playable link).
- Preserve the static-export deployment (`basePath`, `output: "export"`).
- The game follows a strict **PolyU EduGenAI design system** — see
  [`gold_hook/EDUGENAI-README.md`](./gold_hook/EDUGENAI-README.md).
- Don't commit `dist/`, `node_modules/`, or `gold_hook/out/` (all gitignored).