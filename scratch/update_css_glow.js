const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update the background gradients in body
// We want a glow between white and luxury purple.
// Let's change the radial gradients in the body background.
// Original: 
// radial-gradient(circle at 15% 10%, rgba(0, 0, 0, 0.02), transparent 45rem),
// radial-gradient(circle at 85% 90%, rgba(0, 0, 0, 0.01), transparent 45rem),
css = css.replace(/radial-gradient\(circle at 15% 10%, rgba\(0, 0, 0, 0\.02\), transparent 45rem\)/, 'radial-gradient(circle at 15% 10%, rgba(147, 51, 234, 0.06), transparent 50rem)');
css = css.replace(/radial-gradient\(circle at 85% 90%, rgba\(0, 0, 0, 0\.01\), transparent 45rem\)/, 'radial-gradient(circle at 85% 90%, rgba(139, 92, 246, 0.08), transparent 50rem)');

// 2. Liquid Glass Text Effect -> Purple glow
// Original:
// background: linear-gradient(
//   to right,
//   #c5a059 20%,
//   #fdf6d8 30%,
//   #e2c67b 70%,
//   #fdf6d8 80%,
//   #c5a059 100%
// );
css = css.replace(/background: linear-gradient\([\s\S]*?#c5a059 100%\n\s+\);/m, `background: linear-gradient(
    to right,
    #7e22ce 20%,
    #d8b4fe 30%,
    #9333ea 70%,
    #e9d5ff 80%,
    #7e22ce 100%
  );
  filter: drop-shadow(0 0 15px rgba(147,51,234,0.3));`);

// 3. Rename .btn-gold to .btn-purple and update colors
// Original: .btn-gold { background-color: #b8860b; color: white; ... }
css = css.replace(/\.btn-gold/g, '.btn-purple');
css = css.replace(/background-color: #b8860b;/g, 'background-color: #8b5cf6;');
css = css.replace(/background-color: #966f09;/g, 'background-color: #7c3aed;');
css = css.replace(/box-shadow: 0 4px 15px rgba\(184, 134, 11, 0\.2\);/g, 'box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);');
css = css.replace(/box-shadow: 0 6px 20px rgba\(184, 134, 11, 0\.3\);/g, 'box-shadow: 0 6px 25px rgba(139, 92, 246, 0.5);');

// 4. Rename .btn-outline-gold to .btn-outline-purple and update colors
// Original: .btn-outline-gold { border-color: #b8860b; color: #b8860b; ... }
css = css.replace(/\.btn-outline-gold/g, '.btn-outline-purple');
css = css.replace(/border-color: #b8860b;/g, 'border-color: #8b5cf6;');
css = css.replace(/color: #b8860b;/g, 'color: #8b5cf6;');
css = css.replace(/border-color: #966f09;/g, 'border-color: #7c3aed;');
css = css.replace(/color: #966f09;/g, 'color: #7c3aed;');

// 5. Update .gold-line to .purple-line
css = css.replace(/\.gold-line/g, '.purple-line');
css = css.replace(/background: linear-gradient\(to right, transparent, #b8860b, transparent\);/g, 'background: linear-gradient(to right, transparent, #8b5cf6, transparent);');
css = css.replace(/box-shadow: 0 0 10px rgba\(184, 134, 11, 0\.3\);/g, 'box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);');

fs.writeFileSync(cssPath, css);
console.log("CSS updated!");
