import { AVAILABLE_PATTERNS } from '@/constants/patternConstants';
import { PatternType } from '@/types';

export const isValidPattern = (pattern: string): pattern is PatternType => {
  return AVAILABLE_PATTERNS.some(p => p.id === pattern);
};