export const colorHexMap: Record<string, string> = {
  // Reds & Pinks
  red: '#EF4444',
  'dark red': '#991B1B',
  crimson: '#DC143C',
  rose: '#E11D48',
  pink: '#F472B6',
  'dusty pink': '#D4A0A0',
  blush: '#FDB5B5',
  salmon: '#FA8072',
  coral: '#FF7F50',
  burgundy: '#800020',
  plum: '#6B2C5B',
  'deep maroon': '#4A0404',
  magenta: '#C026D3',

  // Oranges & Warm tones
  orange: '#F97316',
  apricot: '#FBCEB1',
  peach: '#FFDAB9',
  terracotta: '#CC5833',

  // Yellows & Greens
  yellow: '#FACC15',
  'golden yellow': '#FFD700',
  gold: '#DAA520',
  lemon: '#FFF44F',
  cream: '#FFFDD0',
  ivory: '#FFFFF0',
  straw: '#E4D96F',
  green: '#22C55E',
  'lime green': '#84CC16',
  chartreuse: '#7FFF00',

  // Blues & Purples
  blue: '#3B82F6',
  'cornflower blue': '#6495ED',
  'pale blue': '#93C5FD',
  lavender: '#C4B5FD',
  lilac: '#C8A2C8',
  purple: '#7C3AED',
  'deep purple': '#4C1D95',
  violet: '#8B5CF6',
  'dark violet': '#5B21B6',

  // Neutrals & Browns
  white: '#FFFFFF',
  'dark brown': '#3E2723',
  bronze: '#CD7F32',
};

/**
 * Get hex color for a color name, with fallback to grey.
 */
export function getColorHex(name: string): string {
  return colorHexMap[name.toLowerCase()] ?? '#9CA3AF';
}
