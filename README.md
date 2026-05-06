# MIM-Website-2026

Magic Internet Money website built with Astro, Vue, and Tailwind CSS.

## Requirements

- Node.js 20+
- npm

## Install

```sh
npm install
```

## Development

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run dev
```

The local dev server usually runs at:

```txt
http://localhost:4321/
```

To match the Codex preview setup:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run dev -- --host 127.0.0.1 --port 4321
```

## Build

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

This runs `astro check` and then creates the static production build in `dist/`.

## Preview Production Build

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run preview
```

## Useful Scripts

```sh
npm run check
npm run build
npm run dev
npm run preview
```

## Notes

- `dist/`, `.astro/`, `.vite/`, and `node_modules/` are intentionally ignored.
- Live market data is fetched client-side from DexScreener.
- The swap section embeds Jupiter Plugin.
