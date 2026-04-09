# Sofia Gutierrez — Industrial Design Portfolio

A warm, minimal, editorial-style single-page portfolio website for industrial designer **Sofia Gutierrez**, built with React and Vite.

---

## Project Purpose

This site is a personal portfolio showcasing Sofia's industrial design work. The visual direction is refined, spacious, and image-forward — designed to feel like a high-end editorial publication rather than a generic corporate site.

**Design principles:**
- Warm, elegant, minimal aesthetic
- Strong visual hierarchy with generous whitespace
- Image-forward layout that dominates the first screen
- Easy to customise: fonts, colors, and content are all controlled via CSS variables and clearly marked placeholder comments

---

## Project Structure

```
portafolio-sofia-gutierrez/
├── index.html                  # Entry HTML — add font <link> tags here
├── vite.config.js              # Vite configuration
├── package.json
├── public/                     # Static assets (images, favicons, etc.)
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root component
    ├── App.css                 # Root layout styles
    ├── index.css               # Global styles, CSS variables, typography
    └── components/
        ├── Navbar.jsx          # Top navigation bar
        ├── Navbar.css          # Navbar styles (sticky, responsive)
        ├── Hero.jsx            # Hero section with 3-image grid
        └── Hero.css            # Hero styles (grid, responsive)
```

### Key files for customisation

| File | What to change |
|------|----------------|
| `src/index.css` | Background color (`--color-background`), font families (`--font-primary`, `--font-secondary`), spacing and color tokens |
| `index.html` | Add `<link>` tags to load custom fonts |
| `src/components/Navbar.jsx` | Wordmark text / SVG logo, nav link labels, CTA href |
| `src/components/Hero.jsx` | Replace placeholder `<div>` blocks with real `<img>` tags; update tagline and subtitle text |

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

---

## Adding Fonts

1. Choose your typefaces (e.g. Cormorant Garamond for headings, Inter for body text).
2. Add a `<link>` tag inside `<head>` in `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
   ```
3. Update the CSS variables in `src/index.css`:
   ```css
   --font-primary: 'Cormorant Garamond', Georgia, serif;
   --font-secondary: 'Inter', system-ui, sans-serif;
   ```

---

## Adding Images

Replace the placeholder `<div>` blocks in `src/components/Hero.jsx` with real images:

```jsx
{/* Before */}
<div className="hero__image hero__image--primary" aria-hidden="true">
  <span className="hero__image-label">Image 01</span>
</div>

{/* After */}
<div className="hero__image hero__image--primary">
  <img src="/images/project-01.jpg" alt="Project 01 — brief description" />
</div>
```

Place image files in the `public/images/` directory so Vite serves them at `/images/...`.

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#FFF6EA` | Page background |
| `--color-text-primary` | `#1a1a1a` | Headings, wordmark |
| `--color-text-secondary` | `#5a5a5a` | Body text, nav links |
| `--color-text-muted` | `#9a9a9a` | Labels, captions |
| `--color-border` | `#e0d8ce` | Dividers, separator |
| `--color-image-placeholder` | `#e8ddd0` | Image placeholder blocks |
