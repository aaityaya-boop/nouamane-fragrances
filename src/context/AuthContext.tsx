'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Customer = {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  wishlist?: string[];
};

type AuthContextType = {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  customer: null,
  setCustomer: () => {},
  isLoading: true,
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.customer) {
            setCustomer(data.customer);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCustomer(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ customer, setCustomer, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
