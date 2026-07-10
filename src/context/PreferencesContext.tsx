'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

type Preferences = {
  theme: 'light' | 'dark' | 'system';
  currency: 'MAD' | 'EUR' | 'USD';
  language: 'fr' | 'en' | 'ar';
};

type PreferencesContextType = {
  preferences: Preferences;
  updatePreferences: (newPrefs: Partial<Preferences>) => void;
  recentlyViewed: number[];
  addRecentlyViewed: (productId: number) => void;
  clearRecentlyViewed: () => void;
  isLoaded: boolean;
};

const defaultPreferences: Preferences = {
  theme: 'system',
  currency: 'MAD',
  language: 'fr',
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load preferences
    const savedPrefs = Cookies.get('nouamane_preferences');
    if (savedPrefs) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(savedPrefs) });
      } catch (e) {
        console.error('Failed to parse preferences cookie', e);
      }
    }

    // Load recently viewed tracking
    const savedViews = Cookies.get('nouamane_recently_viewed');
    if (savedViews) {
      try {
        setRecentlyViewed(JSON.parse(savedViews));
      } catch (e) {
        console.error('Failed to parse recently viewed cookie', e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<Preferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      // Save preferences to cookie (memory)
      Cookies.set('nouamane_preferences', JSON.stringify(updated), { expires: 365, path: '/' });
      return updated;
    });
  }, []);

  const addRecentlyViewed = useCallback((productId: number) => {
    setRecentlyViewed(prev => {
      // Remove if already exists to move it to the front
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10); // Keep last 10 products
      
      // Save browsing activity to cookie (memory)
      Cookies.set('nouamane_recently_viewed', JSON.stringify(updated), { expires: 30, path: '/' });
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    Cookies.remove('nouamane_recently_viewed', { path: '/' });
  }, []);

  return (
    <PreferencesContext.Provider value={{ 
      preferences, 
      updatePreferences, 
      recentlyViewed, 
      addRecentlyViewed, 
      clearRecentlyViewed,
      isLoaded 
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
