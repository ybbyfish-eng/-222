
export const COLORS = {
  EMERALD_DEEP: '#013220',
  EMERALD_BRIGHT: '#004d40',
  GOLD_HIGH: '#FFD700',
  GOLD_SOFT: '#D4AF37',
  RICH_RED: '#8B0000',
  LUXURY_BLACK: '#011612'
};

export const TREE_CONFIG = {
  HEIGHT: 12,
  RADIUS: 5,
  FOLIAGE_COUNT: 120000, // 提升至 120k 粒子
  ORNAMENT_COUNT: 200,
  CHAOS_RADIUS: 25,
  RIBBON_COUNT: 8,
  RIBBON_POINTS: 60,
};

export const ORNAMENT_PROPS = [
  // Gold Variations
  { type: 'box', weight: 2.5, color: '#FFD700' },
  { type: 'box', weight: 2.2, color: '#D4AF37' },
  { type: 'box', weight: 2.8, color: '#CFB53B' },
  { type: 'sphere', weight: 1.1, color: '#FFD700' },
  { type: 'sphere', weight: 1.3, color: '#B45309' },
  
  // Emerald Variations
  { type: 'box', weight: 2.4, color: '#064e3b' },
  { type: 'box', weight: 2.6, color: '#065f46' },
  { type: 'sphere', weight: 1.0, color: '#004d40' },
  { type: 'sphere', weight: 1.2, color: '#013220' },
  { type: 'sphere', weight: 0.9, color: '#0f766e' },

  // Deep Red Variations
  { type: 'sphere', weight: 1.0, color: '#8B0000' },
  { type: 'sphere', weight: 1.1, color: '#6b0000' },
  { type: 'sphere', weight: 1.0, color: '#4d0000' },

  // Lights
  { type: 'light', weight: 0.5, color: '#ffffff' },
  { type: 'light', weight: 0.6, color: '#fff9e6' },
] as const;
