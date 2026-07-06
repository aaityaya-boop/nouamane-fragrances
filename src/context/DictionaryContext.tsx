'use client';

import React, { createContext, useContext } from 'react';

type Dictionary = Record<string, any>;

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({ children, dictionary }: { children: React.ReactNode; dictionary: Dictionary }) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
}
