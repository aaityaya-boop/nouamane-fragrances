const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update the background gradients in body to Oceanic
css = css.replace(/radial-gradient\(circle at 15% 10%, rgba\(147, 51, 234, 0\.06\), transparent 50rem\)/, 'radial-gradient(circle at 15% 10%, rgba(56, 189, 248, 0.15), transparent 50rem)');
css = css.replace(/radial-gradient\(circle at 85% 90%, rgba\(139, 92, 246, 0\.08\), transparent 50rem\)/, 'radial-gradient(circle at 85% 90%, rgba(14, 165, 233, 0.15), transparent 50rem)');
css = css.replace(/linear-gradient\(180deg, var\(--color-bg\) 0%, var\(--color-bg-alt\) 50%, var\(--color-bg-dark\) 100%\)/, 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #082f49 100%)');

// 2. Liquid Glass Text Effect -> Oceanic Silver-Cyan glow
css = css.replace(/background: linear-gradient\([\s\S]*?#7e22ce 100%\n\s+\);/m, `background: linear-gradient(
    to right,
    #38bdf8 20%,
    #e0f2fe 30%,
    #0ea5e9 70%,
    #bae6fd 80%,
    #38bdf8 100%
  );`);
css = css.replace(/filter: drop-shadow\(0 0 15px rgba\(147,51,234,0\.3\)\);/, 'filter: drop-shadow(0 0 15px rgba(56,189,248,0.4));');

// 3. Rename .btn-purple to .btn-blue and update colors
css = css.replace(/\.btn-purple/g, '.btn-blue');
css = css.replace(/background-color: #8b5cf6;/g, 'background-color: #0ea5e9;'); // Sky blue
css = css.replace(/background-color: #7c3aed;/g, 'background-color: #0284c7;'); // Darker blue
css = css.replace(/box-shadow: 0 4px 20px rgba\(139, 92, 246, 0\.35\);/g, 'box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4);');
css = css.replace(/box-shadow: 0 6px 25px rgba\(139, 92, 246, 0\.5\);/g, 'box-shadow: 0 6px 25px rgba(14, 165, 233, 0.6);');

// 4. Rename .btn-outline-purple to .btn-outline-blue
css = css.replace(/\.btn-outline-purple/g, '.btn-outline-blue');
css = css.replace(/border-color: #8b5cf6;/g, 'border-color: #0ea5e9;');
css = css.replace(/color: #8b5cf6;/g, 'color: #0ea5e9;');
css = css.replace(/border-color: #7c3aed;/g, 'border-color: #0284c7;');
css = css.replace(/color: #7c3aed;/g, 'color: #0284c7;');

// 5. Update .purple-line to .blue-line
css = css.replace(/\.purple-line/g, '.blue-line');
css = css.replace(/background: linear-gradient\(to right, transparent, #8b5cf6, transparent\);/g, 'background: linear-gradient(to right, transparent, #0ea5e9, transparent);');
css = css.replace(/box-shadow: 0 0 15px rgba\(139, 92, 246, 0\.4\);/g, 'box-shadow: 0 0 15px rgba(14, 165, 233, 0.5);');

// 6. Root variables (text color to white/silver)
css = css.replace(/--color-text: #1a1a1a;/g, '--color-text: #f8fafc;');
css = css.replace(/--color-text-secondary: #555555;/g, '--color-text-secondary: #cbd5e1;');
css = css.replace(/--color-text-muted: #888888;/g, '--color-text-muted: #94a3b8;');
css = css.replace(/--color-border: #e8e8e8;/g, '--color-border: rgba(255,255,255,0.1);');
css = css.replace(/--color-border-light: #f3f3f3;/g, '--color-border-light: rgba(255,255,255,0.05);');

fs.writeFileSync(cssPath, css);
console.log("CSS updated to Oceanic Glassmorphism!");
