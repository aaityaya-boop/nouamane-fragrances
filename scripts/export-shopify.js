const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function escapeCsv(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function main() {
  const products = await prisma.product.findMany();
  
  const records = [];

  for (const product of products) {
    let images = [];
    try {
      images = JSON.parse(product.images);
    } catch (e) {
      images = [product.images];
    }
    
    let tags = [];
    try {
      tags = JSON.parse(product.tags);
    } catch (e) {
      tags = product.tags ? product.tags.split(',') : [];
    }

    const firstImage = images && images.length > 0 ? images[0] : '';
    
    const handle = product.slug;
    
    const baseRow = {
      'Handle': handle,
      'Title': product.name,
      'Body (HTML)': product.description || product.longDescription || '',
      'Vendor': product.brandLabel || product.brandId || '',
      'Standard Product Type': product.subcategoryLabel || product.subcategory || '',
      'Custom Product Type': '',
      'Tags': Array.isArray(tags) ? tags.join(',') : tags,
      'Published': product.published ? 'TRUE' : 'FALSE',
      'Option1 Name': '',
      'Option1 Value': '',
      'Variant SKU': '',
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': product.stock,
      'Variant Inventory Policy': 'continue',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': '',
      'Variant Compare At Price': '',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'Image Src': firstImage.startsWith('/') ? `https://nayparfum.ma${firstImage}` : firstImage,
      'Status': product.published ? 'active' : 'draft',
    };
    
    if (product.testerPrice && product.testerPrice > 0) {
      // Variant 1: Original
      records.push({
        ...baseRow,
        'Option1 Name': 'Type',
        'Option1 Value': 'Original',
        'Variant SKU': product.sku ? `${product.sku}-ORIG` : '',
        'Variant Price': product.price,
        'Variant Compare At Price': product.originalPrice || '',
      });
      // Variant 2: Tester
      records.push({
        'Handle': handle,
        'Title': '',
        'Body (HTML)': '',
        'Vendor': '',
        'Standard Product Type': '',
        'Custom Product Type': '',
        'Tags': '',
        'Published': '',
        'Option1 Name': 'Type',
        'Option1 Value': 'Tester',
        'Variant SKU': product.sku ? `${product.sku}-TEST` : '',
        'Variant Price': product.testerPrice,
        'Variant Compare At Price': '',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': product.stock,
        'Variant Inventory Policy': 'continue',
        'Variant Fulfillment Service': 'manual',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Image Src': '',
        'Status': ''
      });
    } else {
      records.push({
        ...baseRow,
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Variant SKU': product.sku || '',
        'Variant Price': product.price,
        'Variant Compare At Price': product.originalPrice || '',
      });
    }
    
    if (images && images.length > 1) {
      for (let i = 1; i < images.length; i++) {
        const img = images[i];
        records.push({
          'Handle': handle,
          'Title': '',
          'Body (HTML)': '',
          'Vendor': '',
          'Standard Product Type': '',
          'Custom Product Type': '',
          'Tags': '',
          'Published': '',
          'Option1 Name': '',
          'Option1 Value': '',
          'Variant SKU': '',
          'Variant Price': '',
          'Variant Compare At Price': '',
          'Variant Inventory Tracker': '',
          'Variant Inventory Qty': '',
          'Variant Inventory Policy': '',
          'Variant Fulfillment Service': '',
          'Variant Requires Shipping': '',
          'Variant Taxable': '',
          'Image Src': img.startsWith('/') ? `https://nayparfum.ma${img}` : img,
          'Status': ''
        });
      }
    }
  }

  const columns = [
    'Handle',
    'Title',
    'Body (HTML)',
    'Vendor',
    'Standard Product Type',
    'Custom Product Type',
    'Tags',
    'Published',
    'Option1 Name',
    'Option1 Value',
    'Variant SKU',
    'Variant Inventory Tracker',
    'Variant Inventory Qty',
    'Variant Inventory Policy',
    'Variant Fulfillment Service',
    'Variant Price',
    'Variant Compare At Price',
    'Variant Requires Shipping',
    'Variant Taxable',
    'Image Src',
    'Status'
  ];

  const csvRows = [columns.join(',')];
  for (const row of records) {
    const csvRow = columns.map(col => escapeCsv(row[col] || ''));
    csvRows.push(csvRow.join(','));
  }

  const outPath = path.join(__dirname, '..', 'shopify_products.csv');
  fs.writeFileSync(outPath, csvRows.join('\n'));
  console.log('Saved CSV to', outPath);
}

main().catch(console.error).finally(() => prisma.$disconnect());
