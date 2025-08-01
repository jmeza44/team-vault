import { Pattern } from '@/types';
import {
  architectPattern,
  bubblesPattern,
  circuitBoardPattern,
  fallingTrianglesPattern,
  floatingCogsPattern,
  formalInvitationPattern,
  fourPointStarsPattern,
  graphPaperPattern,
  hexagonsPattern,
  iLikeFoodPattern,
  jigsawPattern,
  jupiterPattern,
  overlappingCirclesPattern,
  skullsPattern,
  squaresPattern,
  topographyPattern,
  yyyPattern,
} from '@/assets';


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