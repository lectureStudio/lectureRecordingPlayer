# lectureRecordingPlayer

A Vue 3 + TypeScript web application that integrates PDF.js and media controls to play lecture recordings recorded with lectureStudio. The app is built with Vite and Tailwind CSS (with DaisyUI) and is configured to produce a single-file HTML build where all JS, CSS, and the PDF.js worker are inlined into `dist/index.html` for easy offline distribution.

## Stack
- Language: TypeScript
- Framework: Vue 3 (Composition API)
- Build tool/bundler: Vite 7
- State management: Pinia
- Styling: Tailwind CSS v4 + DaisyUI
- PDF rendering: pdfjs-dist (PDF.js)
- Virtualization: vue-virtual-scroller
- Linting/formatting: ESLint + dprint

## Entry points
- HTML entry: `index.html` (mounts the app and includes the module script)
- App bootstrap: `src/main.ts` (creates Vue app, registers global components, mounts `#app`)
- Vite config: `vite.config.ts` (plugins, aliases, single-file build settings)

## Requirements
- Node.js and npm
    - TODO: Document the exact Node.js version tested with (recommend using the latest LTS).
- A modern browser (for development preview)

## Getting started
1. Install dependencies:
    - `npm install`
2. Start the dev server (Vite):
    - `npm run dev`
    - The `--host` flag in the script allows access from your local network; Vite will print the URL in the terminal.
3. Open the app in your browser using the URL shown by Vite (typically `http://localhost:5173`).

### Single-file build output
This project is configured to inline all built JS and CSS into the final `dist/index.html` using `vite-plugin-singlefile`.

How to build a single-file HTML:
- Install dependencies:
    - `npm install`
- Build:
    - `npm run build`
- Result:
    - `dist/index.html` will contain inlined JS and CSS (no external `.js` or `.css` files).
    - The PDF.js worker is embedded via an inline web worker, so there are no external worker files. The app can run offline from the single HTML file.

## Available scripts
Defined in `package.json`:
- `npm run dev` — Start Vite dev server (with `--host`).
- `npm run build` — Type-check via `vue-tsc -b` and build with Vite (single-file output enabled).
- `npm run preview` — Preview the built app locally.
- `npm run lint` — Lint and auto-fix with ESLint.
- `npm run format` — Format files with dprint.
- `npm run format:check` — Check formatting with dprint.
- `npm run test` — Run the test suite once with Vitest.
- `npm run test:watch` — Run tests in watch mode.
- `npm run test:coverage` — Run tests and report coverage.

## Contributing
- Run linting and formatting before committing: `npm run lint` and `npm run format`.
- Please open an issue or pull request describing proposed changes.

## License
- This project is licensed under the MIT License. See the LICENSE file for full text.
- Copyright (c) 2025 lectureStudio.
- Third‑party packages are subject to their respective licenses, including but not limited to:
  - pdfjs-dist (Apache-2.0): https://github.com/mozilla/pdf.js/
  - vue and related tooling (MIT): https://github.com/vuejs/
  - Tailwind CSS (MIT): https://github.com/tailwindlabs/tailwindcss
  - DaisyUI (MIT): https://github.com/saadeghi/daisyui
