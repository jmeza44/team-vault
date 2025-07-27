import { AVAILABLE_PATTERNS } from '@/constants/patternConstants';
import { PatternType } from '@/types';

export const isValidPattern = (pattern: string): pattern is PatternType => {
  return AVAILABLE_PATTERNS.some(p => p.id === pattern);
};

// Utility to resolve the correct image URL for a pattern file
export const getPatternFileUrl = (file: any): string => {
  if (!file) return '';
  // If imported as a module object (e.g., { default: 'url' })
  if (typeof file === 'object' && file.default) {
    return file.default;
  }
  // If imported as a string (URL or data URI)
  return file;
};