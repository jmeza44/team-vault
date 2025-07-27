import React, { useState, useEffect } from 'react';
import circuitBoardPattern from '@/assets/patterns/circuit-board.svg?url';
import architectPattern from '@/assets/patterns/architect.svg?url';
import bubblesPattern from '@/assets/patterns/bubbles.svg?url';
import fallingTrianglesPattern from '@/assets/patterns/falling-triangles.svg?url';
import floatingCogsPattern from '@/assets/patterns/floating-cogs.svg?url';
import formalInvitationPattern from '@/assets/patterns/formal-invitation.svg?url';
import fourPointStarsPattern from '@/assets/patterns/4-point-stars.svg?url';
import graphPaperPattern from '@/assets/patterns/graph-paper.svg?url';
import hexagonsPattern from '@/assets/patterns/hexagons.svg?url';
import iLikeFoodPattern from '@/assets/patterns/i-like-food.svg?url';
import jigsawPattern from '@/assets/patterns/jigsaw.svg?url';
import jupiterPattern from '@/assets/patterns/jupiter.svg?url';
import overlappingCirclesPattern from '@/assets/patterns/overlapping-circles.svg?url';
import skullsPattern from '@/assets/patterns/skulls.svg?url';
import squaresPattern from '@/assets/patterns/squares.svg?url';
import topographyPattern from '@/assets/patterns/topography.svg?url';
import yyyPattern from '@/assets/patterns/yyy.svg?url';

export type PatternType = 
  | 'none'
  | 'circuit-board' 
  | 'architect'
  | 'bubbles'
  | 'falling-triangles'
  | 'floating-cogs'
  | 'formal-invitation'
  | '4-point-stars'
  | 'graph-paper'
  | 'hexagons'
  | 'i-like-food'
  | 'jigsaw'
  | 'jupiter'
  | 'overlapping-circles'
  | 'skulls'
  | 'squares'
  | 'topography'
  | 'yyy';

export interface Pattern {
  id: PatternType;
  name: string;
  description: string;
  file: string;
  defaultSize: number;
  category: 'tech' | 'minimal' | 'geometric' | 'organic' | 'fun' | 'formal' | 'nature' | 'abstract';
}

export const AVAILABLE_PATTERNS: Pattern[] = [
  {
    id: 'none',
    name: 'None',
    description: 'No background pattern',
    file: '',
    defaultSize: 0,
    category: 'minimal',
  },
  // Tech & Engineering
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    description: 'Electronic circuit pattern for tech aesthetic',
    file: circuitBoardPattern,
    defaultSize: 304,
    category: 'tech',
  },
  {
    id: 'floating-cogs',
    name: 'Floating Cogs',
    description: 'Mechanical gears for industrial feel',
    file: floatingCogsPattern,
    defaultSize: 120,
    category: 'tech',
  },
  // Geometric & Architectural
  {
    id: 'architect',
    name: 'Architect',
    description: 'Professional architectural blueprint style',
    file: architectPattern,
    defaultSize: 200,
    category: 'formal',
  },
  {
    id: 'graph-paper',
    name: 'Graph Paper',
    description: 'Clean grid lines for structured appearance',
    file: graphPaperPattern,
    defaultSize: 80,
    category: 'geometric',
  },
  {
    id: 'hexagons',
    name: 'Hexagons',
    description: 'Hexagonal pattern for modern geometric style',
    file: hexagonsPattern,
    defaultSize: 100,
    category: 'geometric',
  },
  {
    id: 'squares',
    name: 'Squares',
    description: 'Simple square grid pattern',
    file: squaresPattern,
    defaultSize: 60,
    category: 'geometric',
  },
  {
    id: 'overlapping-circles',
    name: 'Overlapping Circles',
    description: 'Circular patterns with overlapping design',
    file: overlappingCirclesPattern,
    defaultSize: 90,
    category: 'geometric',
  },
  {
    id: 'falling-triangles',
    name: 'Falling Triangles',
    description: 'Dynamic triangular pattern with movement',
    file: fallingTrianglesPattern,
    defaultSize: 100,
    category: 'geometric',
  },
  // Stars & Space
  {
    id: '4-point-stars',
    name: '4-Point Stars',
    description: 'Simple star pattern for elegant decoration',
    file: fourPointStarsPattern,
    defaultSize: 80,
    category: 'geometric',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    description: 'Planetary surface texture',
    file: jupiterPattern,
    defaultSize: 150,
    category: 'nature',
  },
  // Organic & Natural
  {
    id: 'bubbles',
    name: 'Bubbles',
    description: 'Organic bubble pattern for playful feel',
    file: bubblesPattern,
    defaultSize: 120,
    category: 'organic',
  },
  {
    id: 'topography',
    name: 'Topography',
    description: 'Contour lines like topographical maps',
    file: topographyPattern,
    defaultSize: 200,
    category: 'nature',
  },
  // Fun & Creative
  {
    id: 'jigsaw',
    name: 'Jigsaw',
    description: 'Puzzle piece pattern for creative projects',
    file: jigsawPattern,
    defaultSize: 100,
    category: 'fun',
  },
  {
    id: 'i-like-food',
    name: 'Food Items',
    description: 'Food-themed pattern for casual feel',
    file: iLikeFoodPattern,
    defaultSize: 120,
    category: 'fun',
  },
  {
    id: 'skulls',
    name: 'Skulls',
    description: 'Gothic skull pattern for bold aesthetic',
    file: skullsPattern,
    defaultSize: 100,
    category: 'fun',
  },
  // Formal & Professional
  {
    id: 'formal-invitation',
    name: 'Formal Invitation',
    description: 'Elegant pattern for professional appearance',
    file: formalInvitationPattern,
    defaultSize: 150,
    category: 'formal',
  },
  // Abstract
  {
    id: 'yyy',
    name: 'Abstract Y',
    description: 'Abstract Y-shaped pattern',
    file: yyyPattern,
    defaultSize: 80,
    category: 'abstract',
  },
];

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
    variant: 'overlay' as 'fixed' | 'absolute' | 'overlay'
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('team-vault-pattern-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation of loaded settings
        if (parsed && typeof parsed === 'object') {
          setPatternSettings({
            opacity: typeof parsed.opacity === 'number' && parsed.opacity >= 0.005 && parsed.opacity <= 0.15 
              ? parsed.opacity : 0.03,
            size: typeof parsed.size === 'number' && parsed.size >= 0 && parsed.size <= 400 
              ? parsed.size : 0,
            variant: ['fixed', 'absolute', 'overlay'].includes(parsed.variant) 
              ? parsed.variant : 'overlay'
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse pattern settings from localStorage, using defaults');
    }
  }, []);

  const selectedPattern = AVAILABLE_PATTERNS.find(p => p.id === pattern);
  
  if (!selectedPattern || pattern === 'none') {
    return null;
  }

  // Use props if provided, otherwise use settings from localStorage with fallbacks
  const finalOpacity = propOpacity !== undefined ? propOpacity : patternSettings.opacity;
  const finalSize = propSize !== undefined ? propSize : (patternSettings.size || selectedPattern.defaultSize);
  const finalVariant = propVariant !== undefined ? propVariant : patternSettings.variant;
  
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: selectedPattern.file.startsWith('data:') 
      ? `url("${selectedPattern.file}")` 
      : `url(${selectedPattern.file})`,
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

// Pattern preference management
const PATTERN_STORAGE_KEY = 'team-vault-background-pattern';
const DEFAULT_PATTERN: PatternType = 'none';

// Helper function to validate if a string is a valid pattern type
const isValidPattern = (pattern: string): pattern is PatternType => {
  return AVAILABLE_PATTERNS.some(p => p.id === pattern);
};

export const useBackgroundPattern = () => {
  const [pattern, setPattern] = React.useState<PatternType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(PATTERN_STORAGE_KEY);
        if (stored && isValidPattern(stored)) {
          return stored;
        } else if (stored) {
          console.warn(`Invalid pattern "${stored}" found in localStorage, using default`);
          // Save valid default to localStorage
          localStorage.setItem(PATTERN_STORAGE_KEY, DEFAULT_PATTERN);
        } else {
          console.log('No pattern found in localStorage, initializing with default');
          localStorage.setItem(PATTERN_STORAGE_KEY, DEFAULT_PATTERN);
        }
      } catch (e) {
        console.error('Failed to load pattern from localStorage:', e);
        localStorage.setItem(PATTERN_STORAGE_KEY, DEFAULT_PATTERN);
      }
    }
    return DEFAULT_PATTERN;
  });

  const updatePattern = React.useCallback((newPattern: PatternType) => {
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

export default BackgroundPattern;
