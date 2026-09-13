interface Window {
  ColorPaletteLocales?: Record<string, any>;
  ColorPalette?: Record<string, any>;
  [key: string]: any;
}

declare function renderResults(): void;
declare function renderWorkspace(): void;
