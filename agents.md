# AGENTS.md — mini-game_prototype (COMP5241)

Guidance for AI agents (and humans) working in this repository.

## What this is

A COMP5241 mini-game prototype site. It is **one deployable static site** made
of three self-contained pieces:

| Piece | Path | What it is |
| --- | --- | --- |
| Landing page | `index.html` | Static front page linking to everything below |
| **Gold Rush Hook** | `gold_hook/` | A Gold Miner–style SDLC game (Next.js 15 + Canvas 2D + Zustand) |
| Testers & the Bar | `bar_animation/` | A 23-scene animated SVG story (single HTML file) |
| Whip demo | `state your requirements clearly/` | Two HTML interpretations of one prompt (a lesson in prompt precision) |

Each subfolder is **independent** and has its own `agents.md` / `AGENTS.md`
with deeper detail. Read the relevant one before editing that piece:

- `gold_hook/AGENTS.md` — game architecture, design system, tuning knobs
- `bar_animation/agents.md` — the animated story
- `state your requirements clearly/origin whip/agents.md` — first interpretation
- `state your requirements clearly/polyu-style/AGENTS.md` — second interpretation

## Deployment model (important)

The site is deployed as **plain static files** (e.g. on Vercel). There is no
server at runtime. The build pipeline is:

```
npm run build          # root package.json → runs node build.mjs
```

`build.mjs` does three things:

1. Installs + builds the Next.js game (`gold_hook/`) as a **static export**
   (`output: "export"`, `basePath: "/gold_hook"` in `gold_hook/next.config.mjs`),
   producing `gold_hook/out/`.
2. Copies `index.html` → `dist/index.html`.
3. Copies `gold_hook/out/` → `dist/gold_hook/`, plus the two demo folders,
   into `dist/`.

`vercel.json` points Vercel at `buildCommand: npm run build` and
`outputDirectory: dist`. The result is a single `dist/` folder:

```
dist/
  index.html
  gold_hook/...                       ← game (served at /gold_hook/)
  bar_animation/...
  state your requirements clearly/...
```

**Consequences for agents:**

- The game is served from the **`/gold_hook/` subfolder**, so its HTML
  references `/gold_hook/_next/...`. Do **not** remove `basePath` or
  `output: "export"` from `gold_hook/next.config.mjs` unless you also change
  the whole deployment strategy.
- All cross-page links in `index.html` must be **relative** (e.g.
  `gold_hook/`, `bar_animation/testers-bar-polyu.html`). Never hard-code
  `http://localhost:3000` as a *play* link — that only works on a local dev
  server. (The "How to run" section intentionally documents the local dev
  URL; that one is fine.)
- Folder names with spaces (`state your requirements clearly/`,
  `origin whip/`) are load-bearing — the links and the build copy them
  verbatim. Don't rename them without updating `index.html` and `build.mjs`.

## Commands

```bash
# Whole site (what Vercel runs)
npm run build          # → dist/  (installs + builds the game, assembles dist)

# Game only (local dev)
cd gold_hook
npm install
npm run dev            # http://localhost:3000
npm run build          # static export → gold_hook/out
npm run typecheck      # tsc --noEmit

# Demos
# Open the .html files directly in a browser — no build step.
```

There is no committed test suite. Verify by building, opening the pages in a
browser, and (for the game) exercising the phase machine.

## Repo layout

```
index.html                          ← landing page (static, links to everything)
build.mjs                           ← root build: game export + assemble dist/
package.json                        ← root scripts (build, typecheck)
vercel.json                         ← Vercel: buildCommand + outputDirectory
.gitignore                          ← ignores dist/, node_modules/, build artifacts
README.md                           ← project readme
gold_hook/                          ← the game (see gold_hook/AGENTS.md)
bar_animation/                      ← animated SVG story (see its agents.md)
state your requirements clearly/    ← whip demo, two interpretations
```

## Agent rules — do

- Keep the three pieces independent; a change to one should not require
  touching the others.
- Keep all cross-page links in `index.html` relative.
- Preserve the static-export deployment: relative links, `basePath`,
  `output: "export"`.
- Follow each subfolder's own `agents.md`/`AGENTS.md` conventions when
  editing that piece (the game has a strict PolyU design system — see
  `gold_hook/EDUGENAI-README.md`).
- Keep the "prompt precision lesson" section's two demo links pointing at the
  real files (`origin whip/origin whip.html`, `polyu-style/whip_pelican.html`).

## Agent rules — don't

- Don't add a runtime server, API routes, or server-side data fetching to the
  game — the deployment is static.
- Don't hard-code absolute `localhost` URLs as playable links.
- Don't rename the space-containing demo folders without updating both
  `index.html` and `build.mjs`.
- Don't commit `dist/`, `node_modules/`, or `gold_hook/out/` (all gitignored).

## Notes for future agents

- The game's core invariant: **SDLC DO's = gold (earn marks) · DON'Ts = rocks
  (lose marks)** — see `gold_hook/AGENTS.md`.
- The whip demo exists to teach that **concise, unambiguous prompts matter**:
  `origin whip.html` is the first (loose) interpretation of the prompt, and
  `whip_pelican.html` is the result after re-prompting the specific phrase
  "一個自行車騎著人往前走". The landing page's "Prompt precision lesson"
  section explains this.
- If you change the deployment target (e.g. move the game to the site root),
  update `gold_hook/next.config.mjs` (`basePath`), `build.mjs`, and the
  `gold_hook/` links in `index.html` together.
