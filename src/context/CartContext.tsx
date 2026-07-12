'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import Cookies from 'js-cookie';

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
};

export type AppliedPromo = {
  code: string;
  type: string;
  value: number;
};

type AddInput = {
  id: number;
  slug: string;
  name: string;
  price: number | string;
  image?: string;
  images?: string[];
  size?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: AddInput, quantity?: number, size?: string) => void;
  removeFromCart: (id: number, size?: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  shippingFee: number;
  appliedPromo: AppliedPromo | null;
  applyPromo: (promo: AppliedPromo) => void;
  removePromo: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shippingFee, setShippingFee] = useState(35);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  useEffect(() => {
    // Migration: Read from localStorage first, then fallback to Cookies.
    // This prevents losing existing carts for current users.
    let saved = localStorage.getItem('nouamaneCart');
    if (!saved) {
      saved = Cookies.get('nouamaneCart') || null;
    }
    
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        setCart([]);
      }
    }
    
    let savedPromo = localStorage.getItem('nouamanePromo');
    if (!savedPromo) {
      savedPromo = Cookies.get('nouamanePromo') || null;
    }
    
    if (savedPromo) {
      try {
        setAppliedPromo(JSON.parse(savedPromo));
      } catch {
        setAppliedPromo(null);
      }
    }
    
    setIsLoaded(true);

    // Fetch shipping fee
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.shippingFee !== undefined) {
          setShippingFee(data.shippingFee);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const cartStr = JSON.stringify(cart);
      Cookies.set('nouamaneCart', cartStr, { expires: 30, path: '/' });
      // Remove from localStorage to finish migration
      localStorage.removeItem('nouamaneCart');
      
      if (appliedPromo) {
        const promoStr = JSON.stringify(appliedPromo);
        Cookies.set('nouamanePromo', promoStr, { expires: 30, path: '/' });
        localStorage.removeItem('nouamanePromo');
      } else {
        Cookies.remove('nouamanePromo', { path: '/' });
      }
    }
  }, [cart, appliedPromo, isLoaded]);

  const addToCart = (product: AddInput, quantity = 1, size = '50ml') => {
    const priceNum =
      typeof product.price === 'string'
        ? parseFloat(product.price)
        : product.price;
    const image = product.image || product.images?.[0] || '';
    const finalSize = size || product.size || '50ml';

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && i.size === finalSize
      );
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.size === finalSize
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: priceNum,
          image,
          quantity,
          size: finalSize,
        },
      ];
    });
  };

  const removeFromCart = (id: number, size?: string) => {
    setCart((prev) =>
      prev.filter((i) => (size ? !(i.id === id && i.size === size) : i.id !== id))
    );
  };

  const updateQuantity = (id: number, size: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id, size);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const getSubtotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getItemCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  const applyPromo = (promo: AppliedPromo) => setAppliedPromo(promo);
  const removePromo = () => setAppliedPromo(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getItemCount,
        shippingFee: getSubtotal() >= 800 ? 0 : shippingFee,
        appliedPromo,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
