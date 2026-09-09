<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/hero-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/readme/hero.svg">
    <img src="assets/readme/hero.svg" alt="ColorPalette — a local-first color workspace" width="100%">
  </picture>
</div>

<div align="center">

# ColorPalette

**A local-first color workspace for extracting, understanding, relating, and creating colors.**

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Platform: GitHub Pages](https://img.shields.io/badge/Platform-GitHub%20Pages-222222.svg)](https://pages.github.com/)
[![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

[Live site](https://cyojkoy.github.io/ColorPalette/) · [Source](https://github.com/CYoJkoY/ColorPalette) · [Support](https://cyojkoy.github.io/Payment/)

</div>

> **Find a color → understand its relationships → build a palette → save it locally.**

ColorPalette is a static, browser-first application for practical color work. Image sampling, named-color exploration, color analysis, palette generation, favorites, recent colors, and workspace storage all run locally in the browser.

## What it does

| Workflow | Purpose |
| :--- | :--- |
| **Extract** | Read representative colors from a local image. |
| **Explore** | Search a large named-color library assembled from curated and perceptually balanced sources. |
| **Analyze** | Inspect HEX, RGB, HSL, OKLab/OKLCH, contrast, and relationships. |
| **Create** | Generate, edit, reorder, save, and export palettes. |
| **Keep** | Store palettes, favorites, and recent colors in browser `localStorage`. |

No account or application server is required for the core workflows.

## Named color library

ColorPalette combines its existing curated collections with additional external color data:

- Basic colors
- CSS standard colors
- Traditional Chinese colors
- Traditional Japanese colors
- Art and pigment references
- Modern design color scales
- Open Named Colors from `meodai/color-names`
- OKLab Balanced Colors from `meodai/colornames-oklab`

The external datasets are fetched at build time and merged into the static `web/data/colors.json`. The browser never depends on the upstream services at runtime, so the deployed application still reads its color data locally.

Historical and cultural HEX values are digital reference values; they are not claims of one physically exact pigment standard.

## Image extraction

The Extract workflow uses the browser File API and Canvas API. Local images are processed in memory and are not uploaded to an application backend.

## Palette Studio

Palette Studio provides HEX/HSL controls, 15 palette relationships, manual swatch editing, local persistence, and CSS/JSON export.

## Local workspace

Saved palettes, favorites, and recent colors are stored in browser `localStorage`. Clearing the site's browser data removes this local workspace.

## Architecture

```text
Repository
├── core/                # TypeScript color algorithms and curated library
│   ├── color.ts
│   ├── oklab.ts
│   ├── advanced-palette.ts
│   ├── color-library.ts
│   └── modern-colors.ts
├── web/                 # TypeScript browser application source + static assets
│   ├── *.ts
│   ├── locales/         # zh-CN / en-US locale resources
│   └── *.css / *.html   # Static presentation layer
├── tests/               # TypeScript algorithm tests
├── assets/readme/       # README artwork and support graphics
├── docs/
├── package.json         # TypeScript build/test toolchain
├── tsconfig.json        # Node/core/test compilation
├── tsconfig.web.json    # Browser script compilation
└── .github/workflows/   # Quality gates and GitHub Pages deployment
```

The editable application source contains no JavaScript files. Browser TypeScript is compiled by `tsc` into temporary deployment JavaScript during CI; the repository keeps the source of truth in `.ts` form.

The browser scripts remain framework-free and preserve their existing script loading order, global contracts, localStorage model, routing, UI behavior, and visual system. This migration changes the implementation language and build pipeline rather than redesigning the application.

## Development

Install the TypeScript toolchain and run the existing tests:

```bash
npm install
npm test
```

Build the complete project:

```bash
npm run build
```

Build the browser TypeScript sources:

```bash
npm run build:web
```

Regenerate the named-color dataset:

```bash
npm run build:data
```

Serve the generated static site through an HTTP server. The browser color data is loaded with `fetch()`, so opening the HTML file directly is not a supported development mode.

GitHub Actions verifies the TypeScript sources, generated color data, locale parity, required assets, and the final Pages bundle. CI also rejects JavaScript source files under `core/`, `web/`, and `tests/`.

## Deployment

GitHub Pages is deployed automatically from `main` through `.github/workflows/pages.yml`. CI compiles the TypeScript browser sources, combines them with the static HTML/CSS/assets and generated color data, and uploads the resulting deployment bundle.

Public site: **https://cyojkoy.github.io/ColorPalette/**

## Privacy model

- Local images stay in the browser.
- Palettes, favorites, and recent colors stay in `localStorage`.
- No login is required for the core application.
- No server-side color processing is required.

## Support the project

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

## License

ColorPalette is released under the **GNU General Public License v3.0**. See [`LICENSE`](LICENSE) for the complete license text.

<div align="center">

**ColorPalette — find a color, understand it, and turn it into something useful.**

</div>
