const fs = require('fs');
const path = require('path');

function replaceInFile(relativePath, regex, replacement) {
  const filePath = path.join(__dirname, relativePath);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

// 1. FAQ.tsx - Remove Card mention
replaceInFile('../src/components/FAQ.tsx', 
  /\{[\s]*category: 'Payment',[\s]*question: 'Is paying online safe\?',[\s]*answer:[\s]*'Yes\. Card payments are processed through encrypted, PCI-compliant checkout\. We never store your card details on our servers\. Your transaction is fully protected\.',[\s]*\},/g, 
  ''
);
replaceInFile('../src/components/FAQ.tsx', 
  /\{[\s]*category: 'Payment',[\s]*question: 'Can I pay cash when my order arrives\?',[\s]*answer:[\s]*'Yes\. Cash on delivery is available everywhere in Morocco\. Simply select this option at checkout — no card details required\.',[\s]*\},/g, 
  `{
    category: 'Payment',
    question: 'How do I pay for my order?',
    answer: 'We exclusively offer Cash on Delivery (Paiement à la livraison) everywhere in Morocco. You only pay when you receive your order in your hands, ensuring a 100% risk-free experience.',
  },`
);

// 2. order-confirmation/page.tsx
replaceInFile('../src/app/order-confirmation/page.tsx', 
  /paymentMethod: 'cod' \| 'card';/g, 
  `paymentMethod: 'cod';`
);
replaceInFile('../src/app/order-confirmation/page.tsx', 
  /orderDetails\.paymentMethod === 'cod'[\s]*\? 'Paiement à la livraison'[\s]*: 'Carte bancaire'/g, 
  `'Paiement à la livraison'`
);

console.log("FAQ and Order Confirmation updated.");
