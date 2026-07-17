const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/admin/products/page.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onChange=\{e => setFormData\(\{\.\.\.formData, price: Number\(e\.target\.value\)\}\)\}/,
  `onChange={e => {
    const newPrice = Number(e.target.value);
    const newSizes = formData.sizes ? [...formData.sizes] : [];
    if (newSizes.length > 0) {
      newSizes[0].price = newPrice;
    }
    setFormData({...formData, price: newPrice, sizes: newSizes});
  }}`
);

fs.writeFileSync(file, content);
console.log('patched');
