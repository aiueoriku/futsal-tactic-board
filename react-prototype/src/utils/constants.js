export const COURT_CONFIG = {
  width: 800,
  height: 400, // Aspect ratio 2:1 for 40m x 20m
  padding: 50, // Padding for goals and out-of-bounds area
  lineColor: '#ffffff',
  lineWidth: 3,
  bgColor: '#d2a679',
  penaltyRadius: 60, // Approx 6m scaled
};

export const COLORS = {
  home: '#3b82f6',
  away: '#ef4444',
  gkHome: '#fbbf24',
  gkAway: '#10b981',
  text: '#ffffff',
};

export const INITIAL_POSITIONS = {
  full: {
    ball: { x: 51, y: 50 },
    home: [
      { id: 'gk-home', number: 'GK', x: 5, y: 50, role: 'gk' },
      { id: 'home-1', number: '1', x: 40, y: 50, role: 'field' },
      { id: 'home-2', number: '2', x: 30, y: 20, role: 'field' },
      { id: 'home-3', number: '3', x: 30, y: 80, role: 'field' },
      { id: 'home-4', number: '4', x: 20, y: 50, role: 'field' },
    ],
    away: [
      { id: 'gk-away', number: 'GK', x: 95, y: 50, role: 'gk' },
      { id: 'away-1', number: '1', x: 80, y: 50, role: 'field' },
      { id: 'away-2', number: '2', x: 70, y: 20, role: 'field' },
      { id: 'away-3', number: '3', x: 70, y: 80, role: 'field' },
      { id: 'away-4', number: '4', x: 48, y: 50, role: 'field' },
    ],
  },
  half: {
    ball: { x: 50, y: 20 },
    // Home Team (Attacking - Power Play Pyramid)
    // Rotated: x = old_y, y = 100 - old_x
    home: [
      { id: 'gk-home', number: 'GK', x: 50, y: 15, role: 'gk' }, // Fly GK
      { id: 'home-1', number: '1', x: 15, y: 75, role: 'field' }, // Deep Left
      { id: 'home-2', number: '2', x: 85, y: 75, role: 'field' }, // Deep Right
      { id: 'home-3', number: '3', x: 25, y: 30, role: 'field' }, // Wing Left
      { id: 'home-4', number: '4', x: 75, y: 30, role: 'field' }, // Wing Right
    ],
    // Away Team (Defending - Diamond)
    away: [
      { id: 'gk-away', number: 'GK', x: 50, y: 95, role: 'gk' }, // GK in Goal
      { id: 'away-1', number: '1', x: 50, y: 35, role: 'field' }, // Fix
      { id: 'away-2', number: '2', x: 30, y: 55, role: 'field' }, // Ala Left
      { id: 'away-3', number: '3', x: 70, y: 55, role: 'field' }, // Ala Right
      { id: 'away-4', number: '4', x: 50, y: 75, role: 'field' }, // Pivot
    ],
  }
};
