<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/hero-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/readme/hero.svg">
    <img src="assets/readme/hero.svg" alt="ColorPalette — a local-first color workspace for extracting, exploring, analyzing, and creating colors" width="100%">
  </picture>
</div>

<div align="center">

# ColorPalette

**A local-first color workspace for extracting, understanding, relating, and creating colors.**

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Platform: GitHub Pages](https://img.shields.io/badge/Platform-GitHub%20Pages-222222.svg)](https://pages.github.com/)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E.svg)](https://developer.mozilla.org/docs/Web/JavaScript)

[Live site](https://cyojkoy.github.io/ColorPalette/) · [Source](https://github.com/CYoJkoY/ColorPalette) · [Support](https://cyojkoy.github.io/Payment/)

</div>

> **Find a color → understand its relationships → build a palette → save it locally.**

ColorPalette is a static browser application for practical color work. It combines image sampling, a curated named-color library, color analysis, palette generation, local workspace storage, and export without requiring an account or application server.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/palette-dark.svg"><img src="assets/readme/icons/palette.svg" width="22" alt="Palette"></picture> What it is

ColorPalette is designed around one continuous workflow rather than a collection of disconnected tools.

| Stage | Use it for |
| :--- | :--- |
| **Extract** | Sample an exact pixel or extract representative colors from a local image. |
| **Explore** | Search named colors by name, HEX, color system, and family. |
| **Analyze** | Inspect HEX, RGB, HSL, perceptual values, contrast, and color relationships. |
| **Create** | Generate palettes, edit colors, reorder swatches, name palettes, and export them. |
| **Keep** | Save palettes, favorites, and recent colors in browser `localStorage`. |

The application is intentionally local-first: images are processed in the browser, and the workspace does not require a user account.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/image-dark.svg"><img src="assets/readme/icons/image.svg" width="22" alt="Image extraction"></picture> Image extraction

The Extract workflow uses the browser File API and Canvas API. Local image files are not sent to an application backend.

It supports:

- representative color extraction
- dominant, secondary, accent, support, light, and dark roles
- approximate color share
- exact click-to-pick sampling
- direct transfer of extracted colors into Palette Studio

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/book-dark.svg"><img src="assets/readme/icons/book.svg" width="22" alt="Color library"></picture> Named color library

The current dataset contains **492 named colors** across five collections:

- Basic colors
- CSS named colors
- Traditional Chinese colors
- Traditional Japanese colors
- Art and pigment references

Historical and cultural HEX values are presented as digital reference values. They should not be interpreted as one physically exact pigment standard.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/analytics-dark.svg"><img src="assets/readme/icons/analytics.svg" width="22" alt="Analytics"></picture> Color analysis

A color detail view provides the data and relationships needed to move from one color to a usable palette.

**Color values**

HEX · RGB · HSL · OKLab · OKLCH

**Accessibility**

White/black WCAG contrast ratios and practical contrast guidance.

**Relationships**

Analogous · Complementary · Split complementary · Triadic · Tetradic · Double complementary · Monochromatic · Tints · Shades · Tones · Pastel · Vivid · Warm · Cool · Grayscale

Generated relationships can be sent directly into Palette Studio.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/palette-dark.svg"><img src="assets/readme/icons/palette.svg" width="22" alt="Palette Studio"></picture> Palette Studio

Palette Studio is the creation layer of the application.

- HEX and HSL controls
- 15 palette generation modes
- manual color addition and removal
- palette naming
- duplicate and edit workflows
- local persistence
- CSS- and JSON-oriented export

The goal is to turn an interesting color into a reusable color system rather than stop at a single swatch.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/layers-dark.svg"><img src="assets/readme/icons/layers.svg" width="22" alt="Workspace"></picture> Local workspace

Saved palettes, favorites, and recent colors are stored in browser `localStorage`.

No account is required, and clearing the site's browser data removes the local workspace. There is no server-side color-processing requirement.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/architecture-dark.svg"><img src="assets/readme/icons/architecture.svg" width="22" alt="Architecture"></picture> Architecture

```text
Repository
   │
   ├── web/index.html
   ├── web/styles.css
   ├── web/app.js
   └── web/build-data.js
            │
            ▼
      GitHub Actions
            │
      generate colors.json
            │
            ▼
       GitHub Pages
            │
            ▼
        Browser
            │
       localStorage
```

The deployed application is a static site. GitHub Pages provides the delivery layer, while the browser handles interaction, image processing, color calculations, and local workspace persistence.

The legacy `miniprogram/` tree is retained during the migration so the curated color dataset and existing algorithms remain available while the web version becomes the target distribution platform.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/installation-dark.svg"><img src="assets/readme/icons/installation.svg" width="22" alt="Installation"></picture> Run locally

No package manager or frontend framework is required for the application.

```bash
git clone https://github.com/CYoJkoY/ColorPalette.git
cd ColorPalette
node web/build-data.js
python -m http.server 8000 --directory web
```

Open `http://localhost:8000/` in a browser.

Serve the project through HTTP rather than opening `web/index.html` directly as `file://`, because the named-color data is loaded with `fetch()`.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/check-dark.svg"><img src="assets/readme/icons/check.svg" width="22" alt="Tests"></picture> Tests and quality gates

The repository retains algorithm-level Node.js tests for the color engine:

```bash
node tests/color.test.js
```

GitHub Actions additionally checks JavaScript syntax, JSON configuration, required assets, and workspace helpers. Pages deployment is handled by `.github/workflows/pages.yml`.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/folder-dark.svg"><img src="assets/readme/icons/folder.svg" width="22" alt="Repository structure"></picture> Repository structure

```text
ColorPalette/
├── web/
│   ├── index.html          # Static web entry
│   ├── styles.css          # Web UI and theme system
│   ├── app.js              # Browser application
│   ├── build-data.js       # Generates browser color data
│   └── 404.html            # GitHub Pages fallback
├── miniprogram/            # Legacy Mini Program implementation during migration
├── assets/readme/           # README hero, theme variants, support CTA, and icons
├── docs/
├── tests/
├── .github/workflows/
│   ├── check.yml           # Repository quality gates
│   └── pages.yml           # GitHub Pages deployment
├── LICENSE
└── README.md
```

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/download-dark.svg"><img src="assets/readme/icons/download.svg" width="22" alt="Deployment"></picture> Deployment

GitHub Pages is deployed automatically from `main` through `.github/workflows/pages.yml`.

The public site is:

**https://cyojkoy.github.io/ColorPalette/**

If Pages has not been configured yet, use **Settings → Pages → GitHub Actions** as the deployment source.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/contribution-dark.svg"><img src="assets/readme/icons/contribution.svg" width="22" alt="Roadmap"></picture> Roadmap

The current web migration direction includes:

- stronger responsive and mobile-first refinement
- installable PWA support
- keyboard shortcuts
- shareable palette URLs
- drag-and-drop palette editing
- richer OKLCH controls
- color-vision-deficiency simulation
- accessibility-aware palette suggestions
- palette images and downloadable files
- more perceptual image clustering and palette scoring

The core product remains intentionally usable without a backend. Any future cloud synchronization or paid functionality should remain separated from the static core.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/cloud-dark.svg"><img src="assets/readme/icons/cloud.svg" width="22" alt="Privacy"></picture> Privacy model

ColorPalette is local-first by design:

- local image files stay in the browser
- palettes and recent colors stay in `localStorage`
- no login is required
- no server-side color processing is required
- the application does not need personal data to perform its core workflows

GitHub Pages only serves the static application and generated data.

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/contribution-dark.svg"><img src="assets/readme/icons/contribution.svg" width="22" alt="Support"></picture> Support the project

ColorPalette is free to use and its core is open source under GPL-3.0. Support helps fund continued development, maintenance, documentation, and new color workflows.

<div align="center">

<a href="https://cyojkoy.github.io/Payment/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/support-cta.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/readme/support-cta-light.svg">
    <img src="assets/readme/support-cta-light.svg" alt="Support ColorPalette through the project's support page" width="620">
  </picture>
</a>

**Support page:** https://cyojkoy.github.io/Payment/

</div>

## <picture><source media="(prefers-color-scheme: dark)" srcset="assets/readme/icons/license-dark.svg"><img src="assets/readme/icons/license.svg" width="22" alt="License"></picture> License

ColorPalette is released under the **GNU General Public License v3.0**.

Modified and redistributed versions must comply with the applicable GPL-3.0 requirements, including source-code availability and required copyright and license notices.

See [`LICENSE`](LICENSE) for the complete license text.

<div align="center">

**ColorPalette — find a color, understand it, and turn it into something useful.**

</div>
