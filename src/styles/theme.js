/**
 * Centralized theme colors
 * Dark theme uses true blacks and grays (like LinkedIn, Discord, etc.)
 * instead of blue-tinted colors
 */

export const colors = {
  // Light theme
  light: {
    // Backgrounds
    bg: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    // Text
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      tertiary: '#94a3b8',
    },
    // Borders
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
    },
  },

  // Dark theme - True blacks and grays
  dark: {
    // Backgrounds
    bg: {
      primary: '#0a0a0a',      // Near-black background (like LinkedIn)
      secondary: '#1a1a1a',    // Dark gray cards/surfaces
      tertiary: '#242424',     // Slightly lighter surfaces
      elevated: '#2a2a2a',     // Elevated components (modals, dropdowns)
    },
    // Text
    text: {
      primary: '#ffffff',      // White text
      secondary: '#b3b3b3',    // Light gray text
      tertiary: '#808080',     // Medium gray text
    },
    // Borders
    border: {
      primary: '#333333',      // Dark border
      secondary: '#404040',    // Slightly lighter border
    },
  },

  // Accent colors (same for both themes)
  accent: {
    primary: '#3b82f6',        // Blue
    success: '#10b981',        // Green
    warning: '#f59e0b',        // Orange
    error: '#ef4444',          // Red
    income: '#34d399',         // Green for income
    expense: '#f87171',        // Red for expense
  }
};

/**
 * Get color from theme
 * @param {boolean} isDark - Whether dark mode is enabled
 * @param {string} path - Color path (e.g., 'bg.primary', 'text.secondary')
 */
export const getColor = (isDark, path) => {
  const theme = isDark ? colors.dark : colors.light;
  const parts = path.split('.');
  let value = theme;

  for (const part of parts) {
    value = value[part];
    if (!value) return '';
  }

  return value;
};
