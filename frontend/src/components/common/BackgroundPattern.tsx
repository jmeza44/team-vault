import React, { useState, useEffect } from 'react';
import { AVAILABLE_PATTERNS } from '@/constants/patternConstants';
import { getPatternFileUrl } from '@/utils/patternUtils';
import { PatternType } from '@/types';

interface BackgroundPatternProps {
  pattern?: PatternType;
  opacity?: number;
  size?: number;
  variant?: 'fixed' | 'absolute' | 'overlay';
  className?: string;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  pattern = 'none',
  opacity: propOpacity,
  size: propSize,
  variant: propVariant,
  className = '',
}) => {
  // Load pattern settings from localStorage with fallbacks
  const [patternSettings, setPatternSettings] = useState({
    opacity: 0.03,
    size: 0,
    variant: 'overlay' as 'fixed' | 'absolute' | 'overlay',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('team-vault-pattern-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation of loaded settings
        if (parsed && typeof parsed === 'object') {
          setPatternSettings({
            opacity:
              typeof parsed.opacity === 'number' &&
              parsed.opacity >= 0.005 &&
              parsed.opacity <= 0.15
                ? parsed.opacity
                : 0.03,
            size:
              typeof parsed.size === 'number' &&
              parsed.size >= 0 &&
              parsed.size <= 400
                ? parsed.size
                : 0,
            variant: ['fixed', 'absolute', 'overlay'].includes(parsed.variant)
              ? parsed.variant
              : 'overlay',
          });
        }
      }
    } catch (e) {
      console.warn(
        'Failed to parse pattern settings from localStorage, using defaults'
      );
    }
  }, []);

  const selectedPattern = AVAILABLE_PATTERNS.find(p => p.id === pattern);

  if (!selectedPattern || pattern === 'none') {
    return null;
  }

  // Use props if provided, otherwise use settings from localStorage with fallbacks
  const finalOpacity =
    propOpacity !== undefined ? propOpacity : patternSettings.opacity;
  const finalSize =
    propSize !== undefined
      ? propSize
      : patternSettings.size || selectedPattern.defaultSize;
  const finalVariant =
    propVariant !== undefined ? propVariant : patternSettings.variant;

  const fileUrl = getPatternFileUrl(selectedPattern.file);
  const backgroundStyle: React.CSSProperties = {
    backgroundImage:
      typeof fileUrl === 'string' && fileUrl.startsWith('data:')
        ? `url("${fileUrl}")`
        : `url(${fileUrl})`,
    backgroundSize: `${finalSize}px ${finalSize}px`,
    backgroundRepeat: 'repeat',
    opacity: finalOpacity,
    zIndex: 0,
  };

  const baseClasses = 'pointer-events-none dark:invert dark:opacity-[0.08]';

  const variantClasses = {
    fixed: 'fixed inset-0',
    absolute: 'absolute inset-0',
    overlay: 'absolute inset-0',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[finalVariant]} ${className}`}
      style={backgroundStyle}
      aria-hidden="true"
    />
  );
};

export default BackgroundPattern;
