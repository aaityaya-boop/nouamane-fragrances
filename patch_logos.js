const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/\r\n/g, '\n');
    for (let r of replacements) {
        newContent = newContent.replace(r.from, r.to);
    }
    if (newContent !== content.replace(/\r\n/g, '\n')) {
        fs.writeFileSync(filePath, newContent);
        console.log('Patched logos in', filePath);
    }
}

const headerPath = path.join(srcDir, 'components', 'Header.tsx');
const footerPath = path.join(srcDir, 'components', 'Footer.tsx');
const landingHeaderPath = path.join(srcDir, 'components', 'landing', 'LandingHeader.tsx');

// 1. Header.tsx
if (fs.existsSync(headerPath)) {
    replaceInFile(headerPath, [
        {
            from: `<Link href={\`/\${locale}\`} className="group flex flex-col items-center">
                <span
                  className={\`heading-font text-[24px] lg:text-[28px] font-light tracking-[0.25em] transition-colors duration-300 group-hover:text-[#0ea5e9] \${
                    isSolid ? 'text-[#1A1A1A]' : 'text-white'
                  }\`}
                >
                  NAY
                </span>
                <span
                  className={\`text-[8px] font-semibold tracking-[0.35em] uppercase mt-[-2px] \${
                    isSolid ? 'text-[#0ea5e9]' : 'text-white/80'
                  }\`}
                >
                  Parfums
                </span>
              </Link>`,
            to: `<Link href={\`/\${locale}\`} className="group flex flex-col items-center">
                <div
                  className={\`w-12 h-12 lg:w-14 lg:h-14 transition-colors duration-300 group-hover:bg-[#0ea5e9] \${
                    isSolid ? 'bg-[#1A1A1A]' : 'bg-white'
                  }\`}
                  style={{
                    maskImage: 'url("/images/nay/NAY-01.png")',
                    WebkitMaskImage: 'url("/images/nay/NAY-01.png")',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                />
              </Link>`
        }
    ]);
}

// 2. Footer.tsx
if (fs.existsSync(footerPath)) {
    replaceInFile(footerPath, [
        {
            from: `<span className="heading-font text-3xl font-light tracking-[0.28em] text-[#1A1A1A] group-hover:text-[#0ea5e9] transition-colors duration-500">
                NAY
              </span>
              <div className="text-[9px] font-semibold tracking-[0.35em] uppercase text-[#0ea5e9]">
                Parfums
              </div>`,
            to: `<div
                  className="w-16 h-16 lg:w-20 lg:h-20 transition-colors duration-500 bg-[#1A1A1A] group-hover:bg-[#0ea5e9]"
                  style={{
                    maskImage: 'url("/images/nay/NAY-01.png")',
                    WebkitMaskImage: 'url("/images/nay/NAY-01.png")',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                />`
        }
    ]);
}

// 3. LandingHeader.tsx
if (fs.existsSync(landingHeaderPath)) {
    replaceInFile(landingHeaderPath, [
        {
            from: `<span className="heading-font text-xl lg:text-2xl font-light tracking-[0.25em] text-[#1A1A1A]">
            NAY
          </span>
          <span className="text-[7px] lg:text-[8px] font-semibold tracking-[0.3em] uppercase mt-[-2px] text-[#0ea5e9]">
            Parfums
          </span>`,
            to: `<div
            className="w-10 h-10 lg:w-12 lg:h-12 bg-[#1A1A1A] transition-colors duration-300 hover:bg-[#0ea5e9]"
            style={{
              maskImage: 'url("/images/nay/NAY-01.png")',
              WebkitMaskImage: 'url("/images/nay/NAY-01.png")',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }}
          />`
        }
    ]);
}
