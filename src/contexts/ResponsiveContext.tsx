import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MobilePreferences {
  compactView: boolean;
  autoRefresh: boolean;
  hapticFeedback: boolean;
  offlineMode: boolean;
}

export interface ResponsiveContextState {
  menuOpen: boolean;
  expandedCards: string[];
  bottomSheetOpen: boolean;
  mobilePreferences: MobilePreferences;
  setMenuOpen: (open: boolean) => void;
  toggleExpandedCard: (cardId: string) => void;
  setBottomSheetOpen: (open: boolean) => void;
  updateMobilePreferences: (preferences: Partial<MobilePreferences>) => void;
}

const defaultMobilePreferences: MobilePreferences = {
  compactView: false,
  autoRefresh: true,
  hapticFeedback: true,
  offlineMode: false,
};

const ResponsiveContext = createContext<ResponsiveContextState | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [mobilePreferences, setMobilePreferences] = useState<MobilePreferences>(() => {
    // Load preferences from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mobilePreferences');
      if (saved) {
        try {
          return { ...defaultMobilePreferences, ...JSON.parse(saved) };
        } catch {
          return defaultMobilePreferences;
        }
      }
    }
    return defaultMobilePreferences;
  });

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mobilePreferences', JSON.stringify(mobilePreferences));
    }
  }, [mobilePreferences]);

  const toggleExpandedCard = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const updateMobilePreferences = (preferences: Partial<MobilePreferences>) => {
    setMobilePreferences(prev => ({ ...prev, ...preferences }));
  };

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value: ResponsiveContextState = {
    menuOpen,
    expandedCards,
    bottomSheetOpen,
    mobilePreferences,
    setMenuOpen,
    toggleExpandedCard,
    setBottomSheetOpen,
    updateMobilePreferences,
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsiveContext = (): ResponsiveContextState => {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error('useResponsiveContext must be used within a ResponsiveProvider');
  }
  return context;
};