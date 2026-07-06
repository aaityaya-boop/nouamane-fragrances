const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Revert CSS Variables to light mode
css = css.replace(/--color-text: #f8fafc;/g, '--color-text: #1a1a1a;');
css = css.replace(/--color-text-secondary: #cbd5e1;/g, '--color-text-secondary: #555555;');
css = css.replace(/--color-text-muted: #94a3b8;/g, '--color-text-muted: #888888;');
css = css.replace(/--color-border: rgba\(255,255,255,0\.1\);/g, '--color-border: #e8e8e8;');
css = css.replace(/--color-border-light: rgba\(255,255,255,0\.05\);/g, '--color-border-light: #f3f3f3;');

// 2. Revert the body backgrounds
css = css.replace(/radial-gradient\(circle at 15% 10%, rgba\(56, 189, 248, 0\.15\), transparent 50rem\)/, 'radial-gradient(circle at 15% 10%, rgba(0, 0, 0, 0.02), transparent 45rem)');
css = css.replace(/radial-gradient\(circle at 85% 90%, rgba\(14, 165, 233, 0\.15\), transparent 50rem\)/, 'radial-gradient(circle at 85% 90%, rgba(0, 0, 0, 0.01), transparent 45rem)');
css = css.replace(/linear-gradient\(180deg, #020617 0%, #0f172a 50%, #082f49 100%\)/, 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-alt) 50%, var(--color-bg-dark) 100%)');

// 3. Update the .liquid-glass-text to the iOS Apple style
// The iOS style (Siri/Apple Intelligence) is usually a vibrant shifting gradient of cyan, pink, and violet
// with a heavy backdrop blur or drop shadow to make it glow.
const oldLiquidGradient = /background: linear-gradient\([\s\S]*?#38bdf8 100%\n\s+\);/m;
const newLiquidGradient = `background: linear-gradient(
    270deg,
    #0ea5e9 0%,
    #d946ef 25%,
    #8b5cf6 50%,
    #0ea5e9 75%,
    #d946ef 100%
  );
  background-size: 200% auto;
  animation: liquid-pan 4s linear infinite;`;

css = css.replace(oldLiquidGradient, newLiquidGradient);
css = css.replace(/filter: drop-shadow\(0 0 15px rgba\(56,189,248,0\.4\)\);/, 'filter: drop-shadow(0 4px 20px rgba(217, 70, 239, 0.2));');

// Add the keyframes if it doesn't exist
if (!css.includes('@keyframes liquid-pan')) {
  css += `
@keyframes liquid-pan {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
`;
}

fs.writeFileSync(cssPath, css);
console.log("CSS updated to Light Mode + iOS Liquid Text!");
