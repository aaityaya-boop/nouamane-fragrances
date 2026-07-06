const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/:root \{[\s\S]*?\}/, `:root {
  --color-bg: #fdfdfd;
  --color-bg-alt: #ffffff;
  --color-bg-dark: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-secondary: #555555;
  --color-text-muted: #888888;
  --color-accent: #5e4b52;
  --color-accent-dark: #403238;
  --color-accent-light: #9c838d;
  --color-accent-soft: #f4eff1;
  --color-border: #e8e8e8;
  --color-border-light: #f3f3f3;
  --font-serif: 'Cinzel', serif;
  --font-sans: 'Playfair Display', serif;
}`);

css = css.replace(/body \{[\s\S]*?\}/, `body {
  font-family: var(--font-sans);
  font-weight: 500;
  color: var(--color-text);
  background:
    radial-gradient(circle at 15% 10%, rgba(0, 0, 0, 0.02), transparent 45rem),
    radial-gradient(circle at 85% 90%, rgba(0, 0, 0, 0.01), transparent 45rem),
    linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-alt) 50%, var(--color-bg-dark) 100%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`);

css = css.replace(/\.glass \{[\s\S]*?\}/, `.glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid var(--color-border);
}`);

css = css.replace(/\.btn-gold \{[\s\S]*?\}/, `.btn-gold {
  background: var(--color-accent);
  color: #fff;
  font-family: var(--font-sans);
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
  box-shadow: 0 10px 25px -10px var(--color-accent);
  border: none;
}`);

fs.writeFileSync(cssPath, css);
