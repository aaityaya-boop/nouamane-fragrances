const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

const auroraCSS = `
/* =============================================
   2026 AURORA MESH BACKGROUND
   ============================================= */

@keyframes aurora-blob-1 {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes aurora-blob-2 {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(-50px, 30px) scale(0.9); }
  66% { transform: translate(20px, -20px) scale(1.1); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes aurora-blob-3 {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(40px, 40px) scale(1.05); }
  66% { transform: translate(-30px, -30px) scale(0.95); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.aurora-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

/* Glass overlay over the blobs */
.aurora-glass-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(80px);
  z-index: 1;
}

/* Individual Blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.8;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: rgba(56, 189, 248, 0.6); /* Cyan */
  top: -100px;
  left: -100px;
  animation: aurora-blob-1 12s infinite ease-in-out;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: rgba(217, 70, 239, 0.5); /* Pink */
  top: 20%;
  right: -50px;
  animation: aurora-blob-2 15s infinite ease-in-out alternate;
}

.blob-3 {
  width: 700px;
  height: 700px;
  background: rgba(139, 92, 246, 0.5); /* Violet */
  bottom: -200px;
  left: 30%;
  animation: aurora-blob-3 18s infinite ease-in-out;
}
`;

if (!css.includes('2026 AURORA MESH BACKGROUND')) {
  fs.writeFileSync(cssPath, css + '\n' + auroraCSS);
  console.log("Aurora CSS appended!");
} else {
  console.log("Aurora CSS already exists.");
}
