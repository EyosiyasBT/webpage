# eyosiyas.com

Personal portfolio and tools site for Eyosiyas Taye. Live at **eyosiyas.com**.

Deployed automatically from this repo via Cloudflare Pages on every push to `main`.

---

## Pages

| Page | Description |
|---|---|
| **Home** | Intro, stats, project preview |
| **Projects** | Live and showcase project cards |
| **Experience** | Work timeline, education, certifications, languages |
| **Skills** | All skills grouped by category with animated bars |
| **Tools** | Interactive party and boardgame tools |

## Tools

| Tool | Description |
|---|---|
| **Patient Diagnostic System** | Enter a name, receive an instant (fictional) diagnosis |
| **Score Sheet** | Configurable scoresheet — set rows, players, and multipliers |
| **Farkle** | Push-your-luck dice game from Kingdom Come: Deliverance |

## Stack

Pure HTML + CSS + JS — no framework, no build step. All content lives in `data.json` and is rendered by `main.js` at page load.

## Structure

```
data.json     ← all content
main.js       ← all rendering and game logic
style.css     ← all styles
_headers      ← Cloudflare CSP + cache headers
index.html    ← Home
projects.html ← Projects
experience.html
skills.html
tools.html
```

See [DOCS.md](DOCS.md) for a full technical breakdown.
