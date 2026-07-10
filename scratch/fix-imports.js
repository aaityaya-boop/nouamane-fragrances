const fs = require('fs');
const file = 'src/app/[locale]/HomePageClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// The imports should be exactly this:
const correctImports = `'use client';

/**
 * HOMEPAGE — NOUAMANE Parfums
 * Featured products logic: Bestsellers · New Arrivals · Seasonal Trends
 * Positioning: Authorized designer perfume retailer in Morocco
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import BestsellersDirectory from '@/components/BestsellersDirectory';
import SplitTypographyHero from '@/components/SplitTypographyHero';
import FAQ from '@/components/FAQ';
import {
  ArrowRight,
  MoveRight,
  Star,
  Truck,
  ShieldCheck,
  Gift,
  BadgeCheck,
  Sparkles,
  Flame,
  Leaf,
  MessageCircle,
  Quote
} from 'lucide-react';
import {
  Product,
  getSeasonalTrends,
  MAIN_CATEGORIES,
} from '@/lib/products';`;

// Find where `const fadeUpProps: any = {` starts
const fadeUpPropsIndex = content.indexOf('const fadeUpProps: any = {');
if (fadeUpPropsIndex !== -1) {
  content = correctImports + '\n\n' + content.substring(fadeUpPropsIndex);
  fs.writeFileSync(file, content);
  console.log('Fixed imports correctly');
} else {
  console.log('Could not find fadeUpProps');
}
