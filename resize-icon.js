const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'images', 'nay', 'NAY-01.png');
const outputPath = path.join(__dirname, 'src', 'app', 'icon.png');

sharp(inputPath)
  .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(outputPath)
  .then(info => console.log('Successfully resized icon:', info))
  .catch(err => console.error('Error resizing icon:', err));
