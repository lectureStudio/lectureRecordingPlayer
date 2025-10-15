# lectureRecordingPlayer

A simple, user-friendly player for lecture recordings. It shows your slides and thumbnails, as well as searchable page text, alongside the audio or video of the recording. You can share it as a single HTML file which works offline — just open it in a browser. This player's unique selling point is that it renders slides and annotations losslessly, providing pixel-perfect results on any screen.

## Features

- **Synchronized playback**: Audio/video synchronized with slide navigation
- **Searchable content**: Full-text search across slide content
- **Offline support**: Single HTML file that works without internet connection
- **Responsive design**: Works on desktop and mobile devices
- **Keyboard shortcuts**: Full keyboard navigation support
- **Customizable playback**: Variable speed control and time navigation
- **Lossless rendering**: Pixel-perfect slide and annotation display
- **PDF support**: Native PDF rendering with zoom and pan capabilities

## Keyboard Shortcuts
- **Play/Pause:** Space or K
- **Previous/Next page:** Left/Right Arrow
- **First/Last page:** Home/End
- **Volume up/down:** Up/Down Arrow
- **Mute/Unmute:** M
- **Toggle fullscreen:** F
- **Playback speed:** `>` (faster), `<` (slower), `0` or `=` (reset to 1x)
- **Show help dialog:** ?

## Tech Stack
- **Language**: TypeScript
- **Framework**: Vue 3 (Composition API)
- **Build tool/bundler**: Vite 7
- **State management**: Pinia
- **Styling**: Tailwind CSS v4 + DaisyUI
- **PDF rendering**: pdfjs-dist (PDF.js)
- **Virtualization**: vue-virtual-scroller
- **Icons**: @fluentui/svg-icons
- **Schema validation**: Zod
- **Linting/formatting**: ESLint + dprint

## Project Structure
- **HTML entry:** `index.html` (mounts the app and includes the module script)
- **App bootstrap:** `src/main.ts` (creates Vue app, registers global components, mounts `#app`)
- **Vite config:** `vite.config.ts` (plugins, aliases, single-file build settings)
- **Components:** `src/components/` (Vue components for UI)
- **Composables:** `src/composables/` (Vue 3 composition functions)
- **Stores:** `src/stores/` (Pinia state management)
- **Utils:** `src/utils/` (utility functions)
- **Schemas:** `src/schemas/` (Zod validation schemas)

## Requirements
- **Node.js:** 18.18+ (recommended: latest LTS 20+ or 22)
- **npm:** Comes with Node.js
- **Browser:** Modern evergreen browser. Dev server and features target ES2018+ (Vite 7). Tested with Chrome/Edge ≥ 100, Firefox ≥ 100, Safari ≥ 15.

## Getting Started

### Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Put sample content in place (optional but recommended for local testing):
    - Place a lectureStudio encoded recording file named `dev.plr` at the project root (or `public/`).

3. Start the development server:
   ```bash
   npm run dev
   ```
   Vite will display the local and network URLs in the terminal.

4. Open the app in your browser (typically `http://localhost:5173`).

Notes:
- In development, the app loads `/dev.plr` automatically if present (see `src/App.vue`).

### Production Build (single-file)
This project is configured to inline all built JS, CSS and the encoded recording into the final `dist/index.html` using `vite-plugin-singlefile`.

Build:
```bash
npm run build
```

Result:
- `dist/index.html` contains all inlined JS, CSS and the encoded recording (no external files)
- The app can run completely offline from the single HTML file.

How it gets its data in production:
- The build expects your pipeline to inject two placeholders used by the app at runtime:
    - `#{title}`: The title of the lecture (shown in the navigation bar)
    - `#{recording}`: A base64-encoded lectureStudio recording (the entire content of a `.plr` file)

Tip: Because everything is bundled into one HTML, you can open `dist/index.html` directly from the file system.

## Available Scripts
All scripts are defined in `package.json`:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (with `--host` for network access) |
| `npm run build` | Type-check with `vue-tsc -b` and build with Vite (single-file output) |
| `npm run preview` | Preview the built app locally |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run format` | Format files with dprint |
| `npm run format:check` | Check formatting with dprint |
| `npm run test` | Run the test suite once with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests and generate coverage report |

## Contributing
1. Before committing, run linting and formatting:
   ```bash
   npm run lint
   npm run format
   ```
2. Submit changes via pull request with a clear description of proposed changes.
3. Report issues using the GitHub issue tracker.

## License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full text.

**Copyright (c) 2025 lectureStudio.**

### Third‑party Licenses
Third-party packages are subject to their respective licenses:

Runtime dependencies:
- **Vue and related tooling** (MIT): [vuejs](https://github.com/vuejs/)
- **Tailwind CSS** (MIT): [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- **DaisyUI** (MIT): [saadeghi/daisyui](https://github.com/saadeghi/daisyui)
- **Pinia** (MIT): [vuejs/pinia](https://github.com/vuejs/pinia)
- **Fluent UI System Icons** (MIT): [microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons)
- **Vue Virtual Scroller** (MIT): [akryum/vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)
- **PDF.js** (Apache-2.0): [mozilla/pdf.js](https://github.com/mozilla/pdf.js)

Note: Third-party packages are subject to their own licenses; see their repositories for full texts.
