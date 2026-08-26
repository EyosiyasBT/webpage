# Technical Documentation — eyosiyas.com

Full breakdown of how the site is built, how each part works, and how to extend it.

---

## Architecture

The site is fully static — no framework, no build step, no backend. Every page follows the same pattern:

1. Load `data.json` with `fetch`
2. Detect which page is active by checking for a known element ID
3. Call the relevant render function with the data
4. Run scroll animations

```js
fetch('/data.json')
  .then(r => r.json())
  .then(d => {
    renderSidebar(d);
    if (document.getElementById('hero'))              renderHome(d);
    if (document.getElementById('projects-grid'))     renderProjects(d);
    if (document.getElementById('experience-list'))   renderExperience(d);
    if (document.getElementById('skills-page'))       renderSkillsPage(d);
    if (document.getElementById('tools-picker-grid')) renderToolsPicker(d);
    initScrollAnimations();
  });
```

`data.json` is the single source of truth for all content. HTML files contain structure only — no hardcoded content.

---

## File Structure

```
webpage/
├── data.json         ← all site content (see Data Shape below)
├── main.js           ← all rendering logic and tool implementations
├── style.css         ← all styles, CSS variables, animations
├── _headers          ← Cloudflare CSP + Cache-Control rules
├── favicon.svg       ← gold "E" on dark rounded square
├── index.html        ← Home
├── projects.html     ← Projects grid + detail modal
├── experience.html   ← Timeline, education, certs, languages
├── skills.html       ← Skills by category with animated bars
└── tools.html        ← Tool picker + tool modals
```

---

## Data Shape (data.json)

| Key | Used by | Notes |
|---|---|---|
| `name`, `title`, `location`, `status` | Sidebar, hero | Basic identity |
| `email` | Sidebar | Must stay `null` — never rendered |
| `bio` | Hero | Short intro paragraph |
| `skills[]` | Sidebar (top 5) + Skills page | `name`, `category`, `level` (1–5) |
| `certifications[]` | Experience page | `name`, `issuer`, `date` |
| `stats[]` | Home stats row | `github: true` = live API, `skills: true` = count |
| `projects[]` | Projects + home preview | `type` (live/showcase), optional `detail` for modal |
| `experience[]` | Experience timeline | Expandable; first item open by default |
| `education[]`, `languages[]` | Experience page | Static list |
| `tools[]` | Tools picker | `id`, `name`, `description`, `icon` (emoji) |
| `links` | Sidebar, hero CTA | `showcase` and `linkedin` URLs |

---

## Pages

### Home (`index.html`)

- Hero section with typing animation on the job title
- Stats row — one stat uses the GitHub API (`/users/EyosiyasBT`) for public repo count
- Preview of the first 3 projects

### Projects (`projects.html`)

- Split into **Live** (browser-runnable) and **Showcase** (linked to GitHub) sections
- Projects with a `detail` object open a modal with a full abstract and figures
- `fullTitle` is rendered as `innerHTML` to support bold HTML in the title

### Experience (`experience.html`)

- Expandable timeline — first item open by default, rest collapsed
- Also renders education, certifications, and languages below the timeline

### Skills (`skills.html`)

- Groups skills by category, sorted descending by level within each group
- Skill bars start at width 0 and animate in when scrolled into view via `IntersectionObserver`

### Tools (`tools.html`)

- Picker grid rendered from `data.json → tools[]`
- Each tool opens as a modal (X button only — no backdrop dismiss, to preserve state)
- Tool state persists until the page is refreshed
- Adding a new tool requires entries in `data.json`, `tools.html`, `main.js`, and `style.css`

---

## Tools

### Patient Diagnostic System

Fetches a list of illnesses from a text file in the ShowCase repo at runtime:

```
https://raw.githubusercontent.com/EyosiyasBT/ShowCase/main/Tools/PatientDiagnosticSystem/illnesses.txt
```

Lines starting with `x` are positive outcomes (good news). Others are negative, with a random severity 1–5. Each patient gets a persistent ID for the session. A censor toggle hides negative results.

### Score Sheet

A configurable table — adjustable rows (1–20) and players (1–8), optional score multiplier per row, reveal/hide sum toggle, and a blur mode to hide other players' scores.

### Farkle

Push-your-luck dice game based on the version in Kingdom Come: Deliverance.

**Modes:**
- **1 Player** — track how many rounds it takes to reach the target score
- **2 Players** — pass-and-play; the active player's name is shown at the top

**Setup:** enter player name(s), set a target score (default 4000).

**Turn flow:**
1. Click **Roll** — all 6 (or remaining) dice animate with a shake and rapid pip cycling, then land on their final values
2. Scoring dice glow white and are clickable; non-scoring dice fade out
3. Click dice to select them (they lift gold and show a combined score)
4. Click **Roll** again to lock selected dice and re-roll the rest, or **Bank** to end the turn and add the points to your total
5. If a roll produces no scoring dice at all → **Farkle**: turn score is lost, next player's turn

**Hot Dice:** if all 6 dice are committed in one turn, they all reset and you must roll again — carrying your accumulated turn score but risking it on the next roll.

**Scoring:**

| Combination | Points |
|---|---|
| Single 1 | 100 |
| Single 5 | 50 |
| Straight 1–2–3–4–5 | 500 |
| Straight 2–3–4–5–6 | 750 |
| Straight 1–2–3–4–5–6 | 1500 |
| Three 1s | 1000 |
| Three 2s | 200 |
| Three 3s | 300 |
| Three 4s | 400 |
| Three 5s | 500 |
| Three 6s | 600 |
| Each extra die beyond 3 of a kind | doubles the three-of-a-kind value |

Four of a kind = base × 2, five = base × 4, six = base × 8.

---

## CSS Design System

All colours are CSS variables on `:root`:

| Variable | Value | Use |
|---|---|---|
| `--bg` | `#111` | Page background |
| `--sidebar-bg` | `#1a1a1a` | Sidebar, table headers |
| `--accent` | `#f0c040` | Gold — primary brand colour |
| `--text` | `#e0e0e0` | Body text |
| `--muted` | `#888` | Labels, secondary text |
| `--border` | `#2a2a2a` | All borders |
| `--card-bg` | `#1e1e1e` | Cards, inputs |

Key utility classes: `.hidden` (display none), `.fade-in` / `.fade-in.visible` (scroll animation), `.skill-bar-fill` + `.bar-animate` (bar animation), `.modal-overlay.open` (modal visibility).

**No inline styles.** CSP blocks `style="..."` attributes silently — all styles go in `style.css`.

---

## Content Security Policy

Defined in `_headers` and applied by Cloudflare to every response:

```
default-src 'none'
script-src 'self'
style-src 'self'
connect-src 'self' https://api.github.com https://raw.githubusercontent.com
img-src 'self' https://raw.githubusercontent.com
base-uri 'none'
form-action 'none'
frame-ancestors 'none'
```

When CSP blocks something it fails silently — check the browser console for violation errors. No CDN libraries, no inline scripts, no inline styles.

---

## Deployment

Cloudflare Pages is connected to this repo. Every push to `main` auto-deploys to eyosiyas.com in ~60 seconds. There is no staging environment — merging a PR to `main` is immediately live.

All HTML, JS, CSS, and JSON assets have `Cache-Control: no-cache` so changes are picked up on a normal page refresh.

---

## Branch & PR Workflow

`main` is branch-protected — direct pushes are blocked. All changes go through PRs.

```bash
git checkout main && git pull
git checkout -b feat/my-feature
# make changes
git add specific-file.js
git commit -m "feat: description"
git push -u origin feat/my-feature
```

Eyosiyas reviews and merges his own PRs.

---

## Adding a New Tool

1. Add an entry to `data.json → tools[]`: `{ "id": "my-tool", "name": "...", "description": "...", "icon": "🎲" }`
2. Add `<div id="my-tool-modal" class="hidden">` inside `#tool-modal-content` in `tools.html`
3. Add `initMyTool()` in `main.js` with a `._done` guard to prevent re-initialisation
4. Wire it in `openTool()`: `if (toolId === 'my-tool') initMyTool();`
5. Add all styles to `style.css` (no inline styles)
6. If the tool fetches external data, add the URL to `connect-src` in `_headers`
