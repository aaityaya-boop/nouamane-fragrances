const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/checkout/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove import of CreditCard icon
content = content.replace(/CreditCard,\n/g, '');

// Change state to only support cod
content = content.replace(/paymentMethod: 'cod' \| 'card',/g, "paymentMethod: 'cod',");
content = content.replace(/cardNumber: '',\n[\s]*cardName: '',\n[\s]*cardExpiry: '',\n[\s]*cardCvc: '',/g, "");

// Remove the validation block for card
const validationRegex = /if \(form\.paymentMethod === 'card'\) \{[\s\S]*?\}\n/m;
content = content.replace(validationRegex, '');

// Remove the card UI
const cardUIRegex = /\{\/\* Card \*\/\}[\s\S]*?\{\/\* Card form fields \*\/\}[\s\S]*?\}\)}/m;
content = content.replace(cardUIRegex, '');

fs.writeFileSync(filePath, content);
console.log("Checkout cleaned.");
