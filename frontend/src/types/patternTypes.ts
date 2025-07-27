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
  file: typeof import('*?url') | string;
  defaultSize: number;
  category:
    | 'tech'
    | 'minimal'
    | 'geometric'
    | 'organic'
    | 'fun'
    | 'formal'
    | 'nature'
    | 'abstract';
}
