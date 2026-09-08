<div align="center">
  <img src="assets/readme/hero.svg" alt="ColorPalette — Extract, explore, relate, and create colors" width="100%" />
</div>

<div align="center">

# ColorPalette

**A local-first color workspace delivered as a static web application.**

Extract colors from images, browse named color systems, inspect perceptual color values, generate color relationships, build palettes, save your work locally, and export it — all in the browser.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Platform: GitHub Pages](https://img.shields.io/badge/Platform-GitHub%20Pages-222222.svg)](https://pages.github.com/)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E.svg)](https://developer.mozilla.org/docs/Web/JavaScript)

**Live site:** `https://cyojkoy.github.io/ColorPalette/`

</div>

> ColorPalette is built around one workflow: **find a color → understand its relationships → create a palette → save it for later.**

## What it does

| Workflow | What you can do |
| :--- | :--- |
| **Extract** | Pick an exact pixel from an image or automatically extract representative colors. |
| **Explore** | Search the named-color library by name, HEX, collection, and family. |
| **Analyze** | Inspect HEX, RGB, HSL, contrast, and practical palette relationships. |
| **Create** | Generate 15 palette modes, edit colors, reorder them, name palettes, and export them. |
| **Workspace** | Keep palettes and recent colors in browser `localStorage` without an account. |

The website is intentionally static. There is no application server, database, login system, or image-upload backend.

## Static web architecture

```text
GitHub repository
      │
      ├── web/index.html
      ├── web/styles.css
      ├── web/app.js
      └── web/build-data.js
               │
               ↓
       GitHub Actions
               │
       generate colors.json
               │
               ↓
          GitHub Pages
               │
               ↓
        Browser / localStorage
```

GitHub Pages publishes the `web/` directory as the deployed static artifact. The named-color source remains in `miniprogram/utils/color-library.js` for now, and the Pages workflow converts it to browser-friendly JSON during deployment. This keeps the existing curated color dataset as the single source of truth while the application migrates away from the Mini Program runtime.

## Main features

### Image extraction

The Extract page supports local image files through the browser File API and Canvas API. Nothing is uploaded to a server.

It provides:

- representative color ranking
- dominant / secondary / accent / support / light / dark roles
- approximate percentage share
- exact click-to-pick color sampling
- one-click conversion of extracted colors into Palette Studio

### Named color library

The current source contains 492 named colors across five collections:

- Basic colors
- CSS named colors
- Traditional Chinese colors
- Traditional Japanese colors
- Art and pigment references

Historical and cultural HEX values are treated as digital reference values rather than claims of one physically exact pigment standard.

### Color analysis

A color detail view provides:

- HEX
- RGB
- HSL
- white/black WCAG contrast ratios
- contrast guidance
- analogous, complementary, split complementary, triadic, tetradic, double complementary
- monochromatic, tints, shades, tones
- pastel, vivid, warm, cool, and grayscale sets

Every generated relationship can be sent directly into Palette Studio.

### Palette Studio

Palette Studio supports:

- HEX input
- HSL controls
- 15 palette generation modes
- manual color addition
- color removal
- palette naming
- local persistence
- duplicate/edit workflows
- CSS and JSON-oriented export

### Workspace

Saved palettes and recent colors are stored in browser `localStorage`.

There is no account requirement. Clearing browser site data removes the local workspace.

## Privacy model

ColorPalette is local-first by design:

- image files stay in the browser
- palettes stay in `localStorage`
- no login is required
- no server-side color processing is required
- no personal data needs to be sent to the application

GitHub Pages itself is only the static delivery layer.

## Run locally

No package manager or framework is required for the application.

```bash
git clone https://github.com/CYoJkoY/ColorPalette.git
cd ColorPalette
node web/build-data.js
```

Then serve the repository through any static HTTP server with `web/` as the document root. For example:

```bash
python -m http.server 8000 --directory web
```

Open `http://localhost:8000/` in a browser.

The application should be served over HTTP rather than opened directly as `file://`, because the named-color data is loaded with `fetch()`.

## Tests

The repository retains algorithm-level Node.js tests for the existing color engine:

```bash
node tests/color.test.js
```

GitHub Actions additionally validates JavaScript syntax, JSON configuration, required assets, and the workspace helpers.

The Pages deployment is handled by `.github/workflows/pages.yml` using GitHub's official Pages artifact/deployment actions.

## Repository structure

```text
ColorPalette/
├── web/
│   ├── index.html          # Static web entry
│   ├── styles.css          # Web UI
│   ├── app.js              # Browser application
│   ├── build-data.js       # Generates browser color data
│   └── 404.html            # Pages fallback
├── miniprogram/            # Legacy Mini Program implementation during migration
├── assets/readme/           # README visual assets
├── docs/
├── tests/
├── .github/workflows/
│   ├── check.yml           # Repository quality gates
│   └── pages.yml           # GitHub Pages deployment
├── LICENSE
└── README.md
```

The `miniprogram/` tree is retained temporarily so the migration can happen without throwing away the existing algorithms and curated data. It is no longer the target distribution platform.

## Deployment

GitHub Pages is deployed automatically from `main` through `.github/workflows/pages.yml`.

In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source if Pages has not already been enabled for the repository. GitHub Pages then publishes the artifact generated by the Pages workflow.

The project site URL is:

`https://cyojkoy.github.io/ColorPalette/`

A custom domain can be added later without changing the application architecture.

## Roadmap

### Web migration

- responsive mobile-first refinement
- installable PWA shell
- keyboard shortcuts
- shareable palette URLs
- drag-and-drop palette editing
- richer OKLCH controls
- color vision deficiency simulation
- accessibility-aware palette suggestions
- generated palette images and downloadable files

### Color intelligence

- OKLab / OKLCH image clustering
- spatial weighting and subject-region detection
- stronger representative-color ranking
- semantic color roles
- automatic accessibility repair suggestions
- perceptual palette scoring

### Optional future backend

A backend is intentionally not required for the current product. If cloud synchronization or paid entitlements are introduced later, they should be added as separate services rather than coupling the core static application to a server.

## License

ColorPalette is released under the **GNU General Public License v3.0**.

Modified and redistributed versions must comply with the applicable GPL-3.0 requirements, including source-code availability and required copyright and license notices.

See [`LICENSE`](LICENSE) for the complete license text.

<div align="center">

**ColorPalette — find a color, understand it, and turn it into something useful.**

</div>
