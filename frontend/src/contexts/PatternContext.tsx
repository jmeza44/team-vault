import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { PatternType } from '@/types';
import { isValidPattern } from '@/utils';

export interface PatternSettings {
  opacity: number;
  size: number;
  variant: 'fixed' | 'absolute' | 'overlay';
}

// Default settings that will be used when localStorage is empty or invalid
const DEFAULT_PATTERN_SETTINGS: PatternSettings = {
  opacity: 0.03,
  size: 0, // 0 means use pattern's default size
  variant: 'overlay',
};

// Helper function to validate pattern settings
const isValidPatternSettings = (obj: any): obj is PatternSettings => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.opacity === 'number' &&
    obj.opacity >= 0.005 &&
    obj.opacity <= 0.15 &&
    typeof obj.size === 'number' &&
    obj.size >= 0 &&
    obj.size <= 400 &&
    ['fixed', 'absolute', 'overlay'].includes(obj.variant)
  );
};

interface PatternContextType {
  pattern: PatternType;
  updatePattern: (pattern: PatternType) => void;
  settings: PatternSettings;
  updateSettings: (settings: Partial<PatternSettings>) => void;
}

const PatternContext = createContext<PatternContextType | undefined>(undefined);

export const PatternProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { pattern, updatePattern } = useBackgroundPattern();

  const [settings, setSettings] = useState<PatternSettings>(
    DEFAULT_PATTERN_SETTINGS
  );

  // Load settings from localStorage with validation
  useEffect(() => {
    try {
      const saved = localStorage.getItem('team-vault-pattern-settings');
      if (saved) {
        const parsed = JSON.parse(saved);

        // Validate the parsed settings
        if (isValidPatternSettings(parsed)) {
          setSettings(parsed);
        } else {
          console.warn(
            'Invalid pattern settings found in localStorage, using defaults'
          );
          // Save valid defaults to localStorage
          localStorage.setItem(
            'team-vault-pattern-settings',
            JSON.stringify(DEFAULT_PATTERN_SETTINGS)
          );
        }
      } else {
        // No settings in localStorage, save defaults
        console.log(
          'No pattern settings found in localStorage, initializing with defaults'
        );
        localStorage.setItem(
          'team-vault-pattern-settings',
          JSON.stringify(DEFAULT_PATTERN_SETTINGS)
        );
      }
    } catch (e) {
      console.error('Failed to load pattern settings from localStorage:', e);
      // Reset to defaults and save them
      setSettings(DEFAULT_PATTERN_SETTINGS);
      localStorage.setItem(
        'team-vault-pattern-settings',
        JSON.stringify(DEFAULT_PATTERN_SETTINGS)
      );
    }
  }, []);

  // Save settings to localStorage whenever they change (with validation)
  useEffect(() => {
    if (isValidPatternSettings(settings)) {
      try {
        localStorage.setItem(
          'team-vault-pattern-settings',
          JSON.stringify(settings)
        );
      } catch (e) {
        console.error('Failed to save pattern settings to localStorage:', e);
      }
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<PatternSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };

      // Validate the updated settings before applying
      if (isValidPatternSettings(updated)) {
        return updated;
      } else {
        console.warn(
          'Invalid settings update attempted, ignoring:',
          newSettings
        );
        return prev;
      }
    });
  };

  return (
    <PatternContext.Provider
      value={{ pattern, updatePattern, settings, updateSettings }}
    >
      {children}
    </PatternContext.Provider>
  );
};

export const usePatternContext = () => {
  const context = useContext(PatternContext);
  if (context === undefined) {
    throw new Error('usePatternContext must be used within a PatternProvider');
  }
  return context;
};

export default PatternProvider;

// Pattern preference management
const PATTERN_STORAGE_KEY = 'team-vault-background-pattern';
const DEFAULT_PATTERN: PatternType = 'none';

export const useBackgroundPattern = () => {
  const [pattern, setPattern] = useState<PatternType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(PATTERN_STORAGE_KEY);
        if (stored && isValidPattern(stored)) {
          return stored;
        } else if (stored) {
          console.warn(
            `Invalid pattern "${stored}" found in localStorage, using default`
          );
          // Save valid default to localStorage
          localStorage.setItem(PATTERN_STORAGE_KEY, DEFAULT_PATTERN);
        } else {
          console.log(
            'No pattern found in localStorage, initializing with default'
          );
          localStorage.setItem(PATTERN_STORAGE_KEY, DEFAULT_PATTERN);
        }
      } catch (e) {
        console.error('Failed to load pattern from localStorage:', e);
        localStorage.setItem(PATTERN_STORAGE_KEY, DEFAULT_PATTERN);
      }
    }
    return DEFAULT_PATTERN;
  });

  const updatePattern = useCallback((newPattern: PatternType) => {
    if (isValidPattern(newPattern)) {
      setPattern(newPattern);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(PATTERN_STORAGE_KEY, newPattern);
        } catch (e) {
          console.error('Failed to save pattern to localStorage:', e);
        }
      }
    } else {
      console.warn(`Attempted to set invalid pattern: ${newPattern}`);
    }
  }, []);

  return { pattern, updatePattern };
};
