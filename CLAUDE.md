# eyosiyas.com — Claude Code Project Brief

Everything a Claude Code session needs to work on this project. Read this fully before making any changes.

---

## What this project is

Personal portfolio for **Eyosiyas Taye** at **eyosiyas.com**. Two purposes:
1. Present his CV — experience, skills, education, certifications, projects
2. Host interactive party/boardgame tools under a Tools tab

**Fully static site** — pure HTML + CSS + JS. No framework, no build step, no backend. Deployed from GitHub to Cloudflare Pages. All content driven by `data.json`, rendered by `main.js` on every page load.

---

## GitHub repos

- **EyosiyasBT/webpage** — the portfolio site (this repo, work here)
- **EyosiyasBT/ShowCase** — project source code (linked from portfolio)

One live runtime connection between them: the Patient Diagnostic System tool fetches its illness list from `https://raw.githubusercontent.com/EyosiyasBT/ShowCase/main/Tools/PatientDiagnosticSystem/illnesses.txt`. That is the ONLY thing fetched from ShowCase at runtime. All tool logic lives in the webpage repo. Do NOT fetch JS from ShowCase — `script-src 'self'` only.

---

## Hosting — Cloudflare Pages

- Platform: Cloudflare Pages (free tier)
- Connected to: EyosiyasBT/webpage on GitHub
- Build command: **none** — output dir is `/` (repo root)
- Deploy trigger: every push to `main` auto-deploys to production (~60 seconds)
- Domain: eyosiyas.com (DNS in Cloudflare)
- No staging environment — merging a PR to main = live immediately
- Normal F5 picks up new deploys (Cache-Control: no-cache on all assets)

---

## File structure

```
webpage/
├── data.json        ← SINGLE SOURCE OF TRUTH for all content
├── main.js          ← all rendering logic, one file, no bundler
├── style.css        ← all styles, one file, no preprocessor
├── _headers         ← Cloudflare CSP + Cache-Control headers
├── favicon.svg      ← dark rounded square with gold "E"
├── index.html       ← Home page
├── projects.html    ← Projects grid + detail modal
├── experience.html  ← Timeline, education, certs, languages
├── skills.html      ← Skills by category with animated bars
└── tools.html       ← Tool picker + tool modals
```

---

## Architecture — how pages work

Every page fetches `data.json` then detects which page it is by checking element IDs:

```js
fetch('/data.json')
  .then(r => r.json())
  .then(d => {
    renderSidebar(d);
    if (document.getElementById('hero'))             renderHome(d);
    if (document.getElementById('projects-grid'))    renderProjects(d);
    if (document.getElementById('experience-list'))  renderExperience(d);
    if (document.getElementById('skills-page'))      renderSkillsPage(d);
    if (document.getElementById('tools-picker-grid')) renderToolsPicker(d);
    initScrollAnimations();
  });
```

### data.json top-level keys

| Key | Used by | Notes |
|---|---|---|
| `name`, `title`, `location`, `status` | Sidebar, hero | Basic identity |
| `email` | Sidebar (conditional) | **Must stay `null`** — never rendered |
| `bio` | Hero | Short intro paragraph |
| `skills[]` | Sidebar top 5 + Skills page | `name`, `category`, `level` (1–5) |
| `certifications[]` | Experience page | `name`, `issuer`, `date` |
| `stats[]` | Home stats row | `github:true` = live API, `skills:true` = count |
| `projects[]` | Projects + home preview | `type` (live/showcase), optional `detail` for modal |
| `experience[]` | Experience timeline | Expandable, first item open by default |
| `education[]`, `languages[]` | Experience page | Static list |
| `tools[]` | Tools picker | `id`, `name`, `description`, `icon` (emoji) |
| `links` | Sidebar, hero CTA | `showcase` and `linkedin` URLs |

### Project detail modal data shape

The `detail` object inside a project has:
- `abstract` — raw HTML string, can contain `<br><br>`, `<strong>`, `<em>`
- `images[]` — each with `src` and `caption`

`fullTitle` renders as `innerHTML` (not textContent) — intentional, supports bold HTML. `subtitle` is plain text shown in accent italic below the title.

### Sidebar skill bars

The sidebar hardcodes exactly these 5 skill names: `['Problem Solving', 'Python', 'SQL', 'Data Engineering', 'Data Science']`. If those names change in `data.json` the sidebar bars silently disappear.

Sidebar bars are NOT handled by IntersectionObserver (they're always visible). They animate on load via direct `setTimeout` stagger: `300ms + i * 80ms` per bar. Do not try to fix this with the observer.

### `data-github` attribute

The home stats row has a `<span data-github>` populated by `fetchGithubStats()`. If a stat card shows `...` and never updates, this is why — check the GitHub API fetch.

---

## Content Security Policy (_headers)

```
/*
  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self' https://api.github.com https://raw.githubusercontent.com; img-src 'self' https://raw.githubusercontent.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'

/*.html
  Cache-Control: no-cache
/*.js
  Cache-Control: no-cache
/*.css
  Cache-Control: no-cache
/*.json
  Cache-Control: no-cache
```

**When CSP blocks something it fails silently** — the element renders but the style/script is ignored. Always check CSP first when styling seems to have no effect. Check the browser console for CSP violation errors.

---

## Security constraints — always follow

- **NEVER** commit CV PDFs to this repo
- **NEVER** render the email — `data.json` has `"email": null`, keep it null
- **NEVER** use `style="..."` inline attributes — CSP blocks them silently. Use CSS classes only
- **NEVER** use inline `<script>` blocks — all JS goes in `main.js`
- **NEVER** load remote JS — `script-src 'self'` only, no CDN libraries
- **NEVER** use `git add -A` — always stage specific files by name
- Visibility toggling uses `.hidden { display: none !important }` CSS class only
- Cursor styles use CSS classes e.g. `.project-card--clickable { cursor: pointer }`
- External images only from `raw.githubusercontent.com` (whitelisted in CSP)
- Every new HTML page needs `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` in the head

---

## Branch & PR workflow

Branch protection is ON for `main`. Direct pushes are blocked. Everything goes through PRs. **Eyosiyas reviews and merges his own PRs — Claude does not merge.**

```bash
# 1. Always start from latest main
git checkout main && git pull

# 2. Create a feature branch
git checkout -b feat/my-feature
# prefixes: feat/ fix/ refactor/ docs/

# 3. Stage specific files only
git add specific-file.js

# 4. Commit with co-author
git commit -m "feat: short description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# 5. Push and create PR immediately
git push -u origin feat/my-feature
```

---

## GitHub CLI — critical notes

**GitHub CLI is NOT in PATH.** Always use the full path: `C:\Program Files\GitHub CLI\gh.exe`

PR bodies must go to a temp file — PowerShell parses spaces in `--body` as separate arguments:

```powershell
$body = @'
## Summary
- What changed

## Test plan
- [ ] Step 1
'@
$f = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($f, $body, [System.Text.Encoding]::UTF8)
& "C:\Program Files\GitHub CLI\gh.exe" pr create --title "feat: my change" --body-file $f --base main
Remove-Item $f
```

**Shell notes:**
- Working directory: `C:\webpage`
- Primary shell: PowerShell — do NOT use `<<EOF` heredocs (bash only)
- Bash tool is available for POSIX scripts but keep git/gh commands in PowerShell

---

## CSS design system

### CSS variables on `:root`

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#111` | Page background |
| `--sidebar-bg` | `#1a1a1a` | Sidebar, table headers |
| `--accent` | `#f0c040` | Gold — primary brand colour |
| `--text` | `#e0e0e0` | Body text |
| `--muted` | `#888` | Labels, secondary text |
| `--border` | `#2a2a2a` | All borders |
| `--card-bg` | `#1e1e1e` | Cards, inputs |

### Layout

```css
body { display: flex; min-height: 100vh; }
.sidebar { width: 260px; position: sticky; top: 0; height: 100vh; }
.layout { flex: 1; display: flex; flex-direction: column; }
.main { flex: 1; padding: 2.5rem 3rem; width: 100%; }
/* NO max-width on .main */
```

### Key utility classes

| Class | Purpose |
|---|---|
| `.hidden` | `display: none !important` — all show/hide toggling |
| `.project-card--clickable` | `cursor: pointer` |
| `.fade-in` | opacity 0 + translateY(18px) start state |
| `.fade-in.visible` | animated to opacity 1 + translateY(0) |
| `.skill-bar-fill` | starts at width 0, transitions on width |
| `.bar-animate` | triggers the width transition |
| `.level-1` to `.level-5` | final widths: 20%, 40%, 60%, 80%, 100% |
| `.timeline-item--open` | expands timeline body via max-height |
| `.modal-overlay.open` | makes modal visible |
| `.modal--wide` | wider modal variant for Score Sheet tool |
| `.typed-cursor` | blinking cursor animation |
| `.typed-cursor--done` | fades cursor out after typing completes |

---

## JavaScript key functions (main.js, global scope, no modules)

| Function | What it does |
|---|---|
| `renderSidebar(d)` | Renders sidebar on every page. Top 5 skills hardcoded by name. Email only if non-null (keep null). |
| `renderHome(d)` | Hero, stats row, 3-card project preview. Calls `typeText()` after render. |
| `typeText(el, text, speed)` | Char-by-char typing. Adds `.typed-cursor--done` when finished. |
| `renderProjects(d)` | Splits into Live and Showcase. Cards with `detail` field open project modal. |
| `openProjectModal(p)` | Renders `p.fullTitle` as innerHTML (supports bold HTML). Shows subtitle. Closes on backdrop, X, or Escape. |
| `closeProjectModal()` | Removes `.open` from overlay, removes keydown listener. |
| `renderExperience(d)` | Expandable timeline, first item open by default. Also renders education, certs, languages. |
| `renderSkillsPage(d)` | Groups by category, sorts descending by level. Bars start at 0, animate on scroll. |
| `renderToolsPicker(d)` | Renders tool picker grid from `d.tools`. Each card calls `openTool(id)`. |
| `openTool(toolId)` | Hides all tool divs, unhides matching one. Adds `.modal--wide` for scoresheet. Calls tool init. |
| `closeToolModal()` | Removes `.open` from `#tool-modal`. |
| `initSicknessTool()` | Guarded with `._done`. Fetches illnesses.txt. Per-person IDs in `_diagPatientIds`. Lines starting with `x` = positive outcome (strip the x, show green). Others = negative with severity 1–5. History format: `ID \| NAME \| disease \| LVL N`. |
| `initScoreSheet()` | Guarded with `._done`. Manages `_ssState`: `{ rows, players, gameName, rowLabels[], multipliers[], playerNames[], scores[][], sumsRevealed, hideOthers, myPlayer }`. |
| `initScrollAnimations()` | IntersectionObserver for `.fade-in` cards and `.skill-bar-fill` bars on skills page. Sidebar bars use direct setTimeout stagger (always visible, observer never fires for them). |
| `fetchGithubStats()` | Fetches `api.github.com/users/EyosiyasBT`, populates `[data-github]` elements. |

---

## Tools page pattern

Tools open as modals — **X button only to close. Backdrop click intentionally does nothing** (preserves tool state — do not "fix" this). State persists until page refresh.

### Checklist for adding a new tool

1. Add to `data.json` → `tools[]`: `{ "id": "my-tool", "name": "...", "description": "...", "icon": "🎲" }`
2. Add `<div id="my-tool-modal" class="hidden">` inside `#tool-modal-content` in `tools.html`
3. Add `initMyTool()` in `main.js` with `._done` guard
4. Wire in `openTool()`: `if (toolId === 'my-tool') initMyTool();`
5. Add CSS to `style.css` (no inline styles)
6. If fetching external data, add URL to `connect-src` in `_headers`

### Current tools

| Tool | ID | External fetch? | Notes |
|---|---|---|---|
| Patient Diagnostic System | `sickness-tool` | Yes — illnesses.txt from ShowCase | Per-person IDs, censor toggle, clear history |
| Score Sheet | `scoresheet-tool` | No | Configurable rows/players, multipliers, reveal sums, hide others blur |

---

## Pages & nav

| File | Nav | Key element IDs |
|---|---|---|
| `index.html` | Home | `#hero`, `#stats`, `#projects-preview` |
| `projects.html` | Projects | `#projects-grid`, `#project-modal` |
| `experience.html` | Experience | `#experience-list`, `#education-list`, `#certifications-list`, `#languages-list` |
| `skills.html` | Skills | `#skills-page` |
| `tools.html` | Tools | `#tools-picker-grid`, `#tool-modal` |

---

## What is built and live

- Dark portfolio layout (sidebar + top nav + full-width main, no max-width cap)
- Sidebar with top 5 skills and animated bars
- Typing animation on hero title
- Expandable experience timeline (first item open by default)
- Animated skill bars on Skills page (scroll-triggered via IntersectionObserver)
- Card fade-in animations (scroll-triggered)
- Projects page with Live / Showcase split
- Accountability Module detail modal (full verbatim abstract + 11 figures)
- SVG favicon (gold E on dark background)
- Tools picker → modal pattern (X-only close)
- Patient Diagnostic System tool
- Score Sheet tool (configurable rows, players, multipliers, reveal/hide sums)
- Branch protection on main (PRs required)
- Cache-Control: no-cache on all assets

## Planned but not yet built (party/boardgame tools)

- Dice roller, turn timer, random team picker, coin flip, secret role dealer, spin the wheel, who goes first?
- Real profile photo (avatar currently shows "E" initial)
- SpotR project card (app not yet on App Store)

---

## Working style — how Eyosiyas likes to collaborate

- **Casual and direct** — short questions, expects short confirmations back. No long recaps after every change.
- **Confirm the plan briefly before building** — when he asks "does this make sense?" give a short answer then build. Don't ask for confirmation on obvious next steps.
- **"Create a PR" at end of message = do it immediately**, don't ask.
- **Picks options by number** — when given a numbered list he replies "1" or "2". Execute immediately.
- **Moves fast** — jump straight into implementation once direction is clear.
- **Checks in with screenshots** — respond with what's right and what still needs fixing.
- **Does not want** — long trailing summaries, over-engineered abstractions, features beyond what was asked, inline styles or scripts.

## Known friction points (things that have caused confusion before)

- **CSP fails silently** — styling ignored = check browser console for CSP errors first
- **GitHub CLI not in PATH** — always `C:\Program Files\GitHub CLI\gh.exe`, never just `gh`
- **PowerShell not bash** — `@'...'@` not `<<EOF`, no `&&` chains in PS 5.1 (use `;` or `if ($?)`)
- **Sidebar bars always visible** — IntersectionObserver never fires for them; they use setTimeout on load
- **Backdrop close on tool modal is intentional** — do not add backdrop dismiss to tools
- **`p.fullTitle` as innerHTML is intentional** — do not sanitise to textContent
- **ShowCase repo is separate** — don't commit project source files to the webpage repo

## About Eyosiyas

- Data Engineer at **Knowit** (Oslo, since May 2026), previously Capgemini (Aug 2023–May 2026)
- MSc Informatics: Robotics & Intelligent Systems, University of Oslo
- Strong in Python, SQL, Azure, Snowflake, Databricks — not a frontend developer by trade
- This website is a side project
- Email: eyosiyas.taye@knowit.no
