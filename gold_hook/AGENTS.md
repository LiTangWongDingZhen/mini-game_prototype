# AGENTS.md — Gold Rush Hook (PolyU EduGenAI prototype)

> **⚠ This copy is the PolyU EduGenAI house-style prototype** (see
> `EDUGENAI-README.md` in this folder for the brand spec it follows).
> The original game — neon arcade styling — lives in the sibling
> `gold-rush-hook/` folder and remains the upstream source. Keep game
> logic identical to upstream; only the presentation layer differs.

Guidance for AI agents (and humans) working in this repository.

## What this is

**Gold Rush Hook** is a Gold Miner–style browser game about the Software
Development Lifecycle (SDLC). Aim the hook with the mouse, drop it with
**Space** / tap / click, reel in SDLC "DO's" for marks, and dodge the
DON'Ts. Three levels, a between-level shop with 4 upgrades, localStorage
saves, and fully synthesised Web Audio SFX.

- Framework: **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4**
- Rendering: **Canvas 2D** (all game art is canvas-drawn; emoji used in UI)
- State: **Zustand** (single client-side store, localStorage persistence)
- No game engine (no Phaser), all logic client-side and lightweight.

## Core invariant (do not break)

> **SDLC DO's = gold (earn marks) · SDLC DON'Ts = rocks (deduct marks).**

Content is distilled from the course deck *"Software Development Lifecycle"*.
Every object label lives in `lib/game/catalog.ts` (`labels: [...]`), where
`polarity: "good"` entries are ✓ DO's and `polarity: "bad"` are ✗ DON'Ts.
If you change labels or objects, keep the polarity and the ✓/✗ convention.

## Commands

```bash
npm install
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build
npm run start      # serve the production build (add -p <port> to change port)
npm run typecheck  # tsc --noEmit
```

There is no unit/E2E test suite committed; verify changes by running the
build, exercising the game in a browser, and (optionally) Playwright
scripts kept in the sibling `sdlc-hook/` project.

## Architecture map

```
app/
  layout.tsx      Root layout + metadata; Tailwind default sans (system-ui)
  page.tsx        Renders <GameShell />
  globals.css     Tailwind v4 entry; @theme PolyU tokens, .edu-card /
                  .btn-primary / .btn-secondary / .btn-success helpers
components/
  GameShell.tsx   EduGenAI "app card": branded brick-red header bar + HUD +
                  canvas + overlays. Sets window.__GRH__ debug handle to the
                  Zustand store.
  GameCanvas.tsx  Game loop (requestAnimationFrame), input, all canvas art
                  (drawSky / drawGround / per-kind object drawers),
                  HOOK_PRESS_EVENT custom event for the mobile hook button.
  HUD.tsx         In-game HUD: money/target bar, timer, dynamite, mute, HOOK!
  StartScreen.tsx Title + rules (phase "menu")
  ShopModal.tsx   Between-level shop (phase "shop")
  EndScreen.tsx   Game over / victory (phases "gameover" | "victory")
lib/
  store.ts        Zustand store: phases, scoring, upgrades, saves.
                  initFromStorage() is SSR-guarded — keep new client-only
                  code similarly guarded.
  game/
    types.ts      Shared types (ObjectKind, phases, Upgrades, …)
    catalog.ts    ALL game content: DO/DON'T labels, values, weights, radii
    levels.ts     3 level definitions (target, time, object counts),
                  seeded level generation, canvas size constants
    hook.ts       Hook physics (out, reel, grab)
    upgrades.ts   4 shop upgrades: strength / dynamite / clover / time
    audio.ts      Synthesised SFX (Web Audio), mute toggle
    storage.ts    localStorage save/load helpers
```

### Tuning knobs (balance changes live here)

- **Object values / labels / weights:** `lib/game/catalog.ts`
- **Level targets, time limits, spawn counts, canvas size:** `lib/game/levels.ts`
- **Upgrade costs / effects:** `lib/game/upgrades.ts`
- **Hook speed / physics:** `lib/game/hook.ts`

### Phases

`menu → playing → shop → playing → … → gameover | victory` (driven by
`lib/store.ts`). The canvas keeps rendering behind overlays but stops
simulating unless `phase === "playing"`.

## Design system (PolyU EduGenAI house style — per `EDUGENAI-README.md` §1)

- **Palette (tokens in `globals.css` `@theme`):**
  - `--color-polyu` `#A21942` (PolyU Brick Red, primary) · hover `#801333`
  - `--color-ink` `#262626` (charcoal text)
  - `--color-page` `#F8F9FA` (page background) · `--color-line` `#E5E7EB`
    (card borders / dividers)
  - `--color-ok` `#10B981` (success / progress — fills only) ·
    `--color-ok-dark` `#047857` (**green TEXT on white** — `#10B981` fails
    4.5:1 on white, so use `text-ok-dark` for text, `bg-ok` for bars/fills)
- **Type:** Tailwind default sans (system-ui) per the README — no web fonts.
- **Components:** `.edu-card` (white / rounded-lg / gray-200 border /
  shadow-sm), `.btn-primary` (`#A21942` → hover `#801333`), `.btn-secondary`
  (white + gray border), `.btn-success` (`#10B981`).
- **Layout:** `max-w-7xl mx-auto px-4` in `GameShell.tsx`.
- **Icons:** `lucide-react` for interface actions (per README UI stack);
  emoji remain for game *content* (💰/💎/🧨 labels, object art) — user
  sanctioned.
- **Canvas:** bright daytime sky + warm ground (light theme); the neon
  sunset from the original was intentionally replaced.
- **A11y baseline:** global `:focus-visible` ring (brick red),
  `prefers-reduced-motion` kill-switch, ≥44px touch targets, 200ms
  transitions, decorative icons `aria-hidden`.
- Tokens live in `app/globals.css` under `@theme` (**Tailwind v4** — no
  `tailwind.config.js`); component classes in `@layer components`.

## Agent rules — do

- Keep all game logic client-side and engine-free.
- Guard any browser-only code (store hydration, `window.__GRH__`, audio)
  against SSR.
- Preserve the DO=gold / DON'T=rock invariant and ✓/✗ label convention.
- Respect `prefers-reduced-motion` (global kill-switch in `globals.css`).
- Keep interactive elements ≥ 44px, visible focus rings (global
  `:focus-visible`), and hover transitions ~150–300ms.
- Use the design tokens from `globals.css` (e.g. `bg-polyu`, `text-ink`,
  `border-line`, `bg-ok`/`text-ok-dark`) instead of hard-coding new ad-hoc
  palettes.
- `window.__GRH__.getState()` / `.setState(...)` is an intentional debug
  handle — useful for E2E assertions (e.g. pumping marks to test the shop).

## Agent rules — don't

- Don't add a game engine, new state libraries, or server-side game logic.
- Don't introduce a `tailwind.config.js` for theming; extend `@theme` instead.
- Don't bring back arcade fonts / neon classes — the house style is the
  requirement for this prototype (README §1 wins over skill suggestions).
- Don't use `#10B981` (`text-ok`) for text on white — use `text-ok-dark`.
- Don't delete `window.__GRH__`, the SSR guards, or the seeded level
  generation (refresh-resume depends on it).
- Don't change the phase machine in `store.ts` without updating all five
  phase-consuming components.

## Notes for future agents

- Prior phase found & fixed: `tickTimer` only persisting `timeLeft` on
  second boundaries (countdown deadlock) and `bestScore` not updating in
  store at run end — regressions there reappear as a frozen clock or a
  best-score that never grows.
- Canvas logical size is 800×560 (`CANVAS_W/H` in `lib/game/levels.ts`);
  DPR scaling handled in `GameCanvas.tsx`.
- `README.md` documents the art/audio swap guide — update it if the visual
  language changes.
- `EDUGENAI-README.md` (this folder) is the PolyU brand spec this copy must
  keep matching; if the brand spec changes, re-derive `globals.css` tokens
  from it.

## Changelog

### 2026-10-10 — PolyU EduGenAI house-style rebrand (this copy)

Created as a copy of `gold-rush-hook/` (files only; `node_modules`/
`.next` excluded, then `npm install`) and restyled to match
`EDUGENAI-README.md` §1 (brand spec copied here as `EDUGENAI-README.md`).

**Design system (via ui-ux-pro-max skill; README brand rules take
precedence over the skill's generic "educational" suggestions):**

- `app/layout.tsx` — removed Press Start 2P / VT323 (`next/font`); now
  Tailwind default sans; metadata retitled "EduGenAI (PolyU) prototype";
  themeColor → `#F8F9FA`.
- `app/globals.css` — replaced arcade `@theme` tokens with PolyU tokens
  (`polyu`, `polyu-dark`, `ink`, `page`, `line`, `ok`, `ok-dark`);
  new helpers `.edu-card`, `.btn-primary`, `.btn-secondary`,
  `.btn-success`; light color-scheme; focus ring → brick red; removed
  blink/marquee keyframes and `.neon-text-*` / `.arcade-*` classes; kept
  `prefers-reduced-motion` kill-switch.
- `components/GameShell.tsx` — neon cabinet + marquee ticker replaced with
  a white EduGenAI card: brick-red branded header (title + EduGenAI
  badge), `max-w-7xl mx-auto px-4`, light page background, footer legend.
- `components/HUD.tsx` — white chips with `#E5E7EB` borders, emerald
  progress bar, brick-red Dynamite/`HOOK!` primary buttons, Lucide icons
  (`Anchor`, `Bomb`, `Volume2`/`VolumeX`), ≥44px targets.
- `components/StartScreen.tsx` — white card, brick-red title, Lucide
  `CheckCircle2`/`XCircle` rule markers (DO green / DON'T red semantics),
  `Play`/`RotateCcw` buttons.
- `components/ShopModal.tsx` — white cards, emerald level pips, `Store`
  header icon, brick-red Buy buttons, emerald `Start Level` CTA.
- `components/EndScreen.tsx` — `Trophy`/`Timer` status badges, emerald
  victory / brick-red defeat accents, Lucide `RotateCcw`/`Home` buttons.
- `components/GameCanvas.tsx` — `drawSky`: neon sunset → bright daytime
  gradient (`#60a5fa → #bae6fd → #fef9c3`), soft yellow sun, white clouds;
  `drawGround`: brighter earth + lime grass lip. Object art unchanged.
- `package.json` — renamed `gold-rush-hook-prototype`; added
  `lucide-react` (interface icons, per README UI stack).

**Review fixes applied:**

- `#10B981` text on white measured ~2.4:1 (fails 4.5:1) → added
  `--color-ok-dark #047857` and switched all green *text* to `text-ok-dark`
  (HUD carry/toast, StartScreen tagline, GameShell legend, victory title);
  `bg-ok` kept for progress bar / pips (non-text).

**Verified:** `tsc --noEmit` ✓, `next build` ✓, served on
`http://localhost:3112`; Playwright: timer ticks (89→86s), level-clear →
shop transition ✓, upgrade purchase ✓, screenshots at 1024 / 375 px ✓.
