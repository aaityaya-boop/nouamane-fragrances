import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  varchar,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

/* ============================================================
   PRODUCTS (mirrored to lib/products for static/UI usage)
   ============================================================ */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  notes: text('notes').notNull(),
  size: varchar('size', { length: 20 }).notNull().default('50ml'),
  ingredients: text('ingredients'),
});

/* ============================================================
   REVIEWS
   ============================================================ */
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productSlug: varchar('product_slug', { length: 100 }).notNull(),
  author: varchar('author', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 200 }),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/* ============================================================
   ORDERS
   ============================================================ */
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 30 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 200 }).notNull(),
  customerEmail: varchar('customer_email', { length: 200 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 30 }).notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: varchar('shipping_city', { length: 100 }).notNull(),
  shippingPostalCode: varchar('shipping_postal_code', { length: 20 }),
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(),
  items: jsonb('items').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type NewOrder = typeof orders.$inferInsert;
