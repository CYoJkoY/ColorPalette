<div align="center">
  <img src="assets/readme/hero.svg" alt="ColorPalette — Extract, explore, relate, and create colors" width="100%" />
</div>

<div align="center">

# ColorPalette

**A practical color workspace for finding, understanding, and building color palettes inside WeChat.**

Extract colors from images, browse named color systems, inspect perceptual color values, generate color relationships, and turn a single color into a finished palette.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Platform: WeChat Mini Program](https://img.shields.io/badge/Platform-WeChat%20Mini%20Program-07C160.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E.svg)](https://developer.mozilla.org/docs/Web/JavaScript)

</div>

> ColorPalette is built around one simple workflow: **find a color → understand its relationships → create a palette → save it for later.**

## <img src="assets/readme/icons/palette.svg" width="20" alt=""> What ColorPalette Does

ColorPalette combines four jobs that are usually split across different tools:

| Workflow | What you can do |
| :--- | :--- |
| **Extract** | Pick a color from an image or extract representative colors from an image. |
| **Explore** | Search named colors across multiple color systems and filter them by hue family. |
| **Analyze** | Inspect HEX, RGB, HSL, OKLab, OKLCH, perceptual lightness, nearby colors, and contrast. |
| **Create** | Generate color relationships, tune a base color, combine library colors, and save palettes. |

The goal is not to expose every possible color operation. The goal is to make common color decisions fast and understandable.

## <img src="assets/readme/icons/image.svg" width="20" alt=""> Why It Is Useful

### <img src="assets/readme/icons/target.svg" width="18" alt=""> Start from the color you already have

A screenshot, illustration, game asset, website, photograph, or reference image can become the starting point. Manual picking is available when an exact visual location matters; automatic extraction provides a compact representative palette.

### <img src="assets/readme/icons/book.svg" width="18" alt=""> Search colors by meaning, not only by numbers

The color library contains **492 named colors** across five collections:

- Basic colors
- CSS named colors
- Traditional Chinese colors
- Traditional Japanese colors
- Art and pigment references

Search supports names, English/Japanese aliases where available, collection names, and HEX values. Hue-family filtering makes large collections easier to scan.

> Digital HEX values for historical, cultural, and pigment references are treated as reference values rather than claims of one physically exact pigment standard.

### <img src="assets/readme/icons/layers.svg" width="18" alt=""> Turn one color into a system

A color detail page now generates practical relationships instead of stopping at a HEX value:

- Analogous
- Complementary
- Split complementary
- Triadic
- Tetradic
- Double complementary
- Warm range
- Cool range
- Monochromatic
- Tints
- Shades
- Tones

Every generated relationship can be inspected and taken directly into Palette Studio.

## <img src="assets/readme/icons/search.svg" width="20" alt=""> Color Detail and Analysis

Selecting a named color opens a dedicated analysis view.

```text
Named color
    │
    ├── HEX
    ├── RGB
    ├── HSL
    ├── OKLab
    └── OKLCH
         │
         ├── Perceptual lightness scale
         ├── Palette relationships
         ├── WCAG contrast checks
         └── Nearby colors by OKLab distance
                    │
                    ↓
              Palette Studio
```

### <img src="assets/readme/icons/analytics.svg" width="18" alt=""> Perceptual color information

OKLab and OKLCH are included because RGB and HSL are not ideal for every perceptual color task. ColorPalette uses OKLab distance for nearby-color discovery and OKLab lightness for its nine-step perceptual scale.

### <img src="assets/readme/icons/check.svg" width="18" alt=""> Contrast guidance

The detail page calculates relative-luminance contrast ratios against white and black and labels the result with practical guidance such as `AAA text`, `AA text`, `Large text`, or `Decorative`.

These labels are guidance only. Final accessibility decisions still depend on the actual text size, weight, surrounding colors, and rendered interface.

## <img src="assets/readme/icons/palette.svg" width="20" alt=""> Palette Studio

Palette Studio is the creation workspace rather than a passive color viewer.

```text
Choose a base color
       │
       ├── Enter HEX
       ├── Pick from the color library
       └── Continue from image extraction
                ↓
          Tune HSL values
                ↓
       Choose a palette mode
                ↓
        Generate a base palette
                ↓
       Add named colors manually
                ↓
          Save the palette
```

The current generator supports **15 modes**, including relationship palettes, tonal variations, warm/cool ranges, pastel and vivid sets, and grayscale.

A generated palette can be extended with colors from the library, making the workflow useful for UI design, illustration, game assets, branding studies, and other visual work.

## <img src="assets/readme/icons/image.svg" width="20" alt=""> Image Color Extraction

ColorPalette provides two complementary extraction paths.

| Mode | Best for | Behavior |
| :--- | :--- | :--- |
| **Manual picker** | Exact pixels and visual references | Choose a location in the image and read its color. |
| **Automatic extraction** | Quick palette discovery | Sample and quantize the image, then rank representative colors. |

The current implementation prioritizes stable execution inside the WeChat Mini Program runtime. More advanced perceptual clustering remains on the roadmap.

## <img src="assets/readme/icons/architecture.svg" width="20" alt=""> Technical Foundation

ColorPalette is intentionally built with a small native stack rather than a large color dependency tree.

```text
miniprogram/utils/
├── color.js
│   ├── HEX ↔ RGB
│   ├── RGB ↔ HSL
│   ├── palette generation
│   └── WCAG contrast calculations
├── oklab.js
│   ├── RGB ↔ OKLab
│   ├── RGB ↔ OKLCH
│   ├── perceptual distance
│   └── lightness adjustment
├── advanced-palette.js
│   ├── OKLab lightness ramps
│   └── palette deduplication
└── color-library.js
    ├── named-color collections
    ├── hue families
    └── searchable metadata
```

The core color modules can be exercised independently with Node.js, which keeps algorithm changes testable without launching the Mini Program runtime.

## <img src="assets/readme/icons/installation.svg" width="20" alt=""> Run Locally

### <img src="assets/readme/icons/package.svg" width="18" alt=""> Requirements

- WeChat Developer Tools
- A WeChat Mini Program AppID
- Node.js 20+ for repository tests

### <img src="assets/readme/icons/download.svg" width="18" alt=""> Clone and test

```bash
git clone https://github.com/CYoJkoY/ColorPalette.git
cd ColorPalette
node tests/color.test.js
```

Open the repository root in WeChat Developer Tools, configure your AppID in `project.config.json`, and run the `miniprogram/` application.

## <img src="assets/readme/icons/check.svg" width="20" alt=""> Quality Gates

Every push is checked by GitHub Actions.

The automated checks cover:

- Core color conversion and palette generation
- OKLab and OKLCH calculations
- Named-color collection sizes and search behavior
- Color-detail data and relationship generation
- JavaScript syntax
- Mini Program JSON configuration
- Required README assets

The project prefers algorithm-level tests over simply checking whether a page can open.

## <img src="assets/readme/icons/shield.svg" width="20" alt=""> Monetization Without Blocking the Core Workflow

ColorPalette uses a Free + Pro + Rewarded Ad model.

The core workflow remains usable without watching advertisements. Rewarded ads are opt-in and are only presented when a user explicitly chooses to exchange a completed ad view for temporary Pro access.

Hard UX rules:

- No startup advertisements.
- No forced interstitials during extraction or palette creation.
- No deceptive download-style ad buttons.
- No blocking core features because an ad was declined.
- No reward before a rewarded ad is completed.

The current test pricing model is:

| Plan | Test price | Access |
| :--- | :---: | :--- |
| Free | ¥0 | Core color workflow |
| Monthly | ¥3.9 / 30 days | Pro |
| Yearly | ¥19.9 / 365 days | Pro |
| Rewarded Ad | Free | 24 hours of temporary Pro after a completed ad |

Production payment verification, order creation, refunds, idempotency, advertising credentials, and final entitlement delivery should be handled by a trusted backend. Production credentials are not stored in this repository.

See [`docs/MONETIZATION.md`](docs/MONETIZATION.md) for the current monetization boundary.

## <img src="assets/readme/icons/folder.svg" width="20" alt=""> Project Structure

```text
ColorPalette/
├── miniprogram/
│   ├── pages/
│   │   ├── home/             # Discovery and featured palettes
│   │   ├── palette/          # Palette presentation
│   │   ├── extractor/        # Image extraction and manual picking
│   │   ├── create/           # Palette Studio
│   │   ├── library/          # Named-color browser
│   │   ├── color-detail/     # Color analysis and relationships
│   │   ├── favorites/        # Local favorites
│   │   └── pro/              # Pro and monetization entry
│   ├── services/
│   │   └── monetization.js   # Advertising and payment boundary
│   └── utils/
│       ├── color.js
│       ├── oklab.js
│       ├── advanced-palette.js
│       ├── color-library.js
│       ├── share.js
│       └── storage.js
├── assets/readme/            # README hero, icons, and visual assets
├── docs/
│   └── MONETIZATION.md
├── tests/
│   └── color.test.js
├── .github/workflows/
│   └── check.yml
├── LICENSE
└── README.md
```

## <img src="assets/readme/icons/roadmap.svg" width="20" alt=""> Roadmap

### <img src="assets/readme/icons/analytics.svg" width="18" alt=""> Color intelligence

- Lab / OKLab image clustering
- Spatial weighting and subject-region detection
- More stable representative-color ranking
- Color vision deficiency simulation
- More precise OKLCH editing
- Accessibility-aware palette suggestions

### <img src="assets/readme/icons/download.svg" width="18" alt=""> Export and sharing

- Palette image generation
- PNG, text, and CSS export
- Palette naming and tagging
- Better favorite search
- One-tap conversion from extraction results to saved palettes

### <img src="assets/readme/icons/cloud.svg" width="18" alt=""> Cloud workflow

- WeChat cloud synchronization
- Server-backed Pro entitlements
- Order and refund synchronization
- Privacy-conscious product analytics

## <img src="assets/readme/icons/contribution.svg" width="20" alt=""> Contributing

Issues and pull requests are welcome, especially for:

- Color algorithms
- High-quality named-color data
- Image clustering
- Accessibility tooling
- Mini Program compatibility
- Palette workflows and interaction improvements

Do not commit production credentials, payment secrets, API tokens, or personal user data.

## <img src="assets/readme/icons/license.svg" width="20" alt=""> License

ColorPalette is released under the **GNU General Public License v3.0**.

Modified and redistributed versions must comply with the applicable GPL-3.0 requirements, including source-code availability and required copyright and license notices.

See [`LICENSE`](LICENSE) for the complete license text.

<div align="center">

**ColorPalette — find a color, understand it, and turn it into something useful.**

</div>
