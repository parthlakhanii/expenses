/**
 * Centralized theme colors and typography
 * Dark theme uses true blacks and grays (like LinkedIn, Discord, etc.)
 * instead of blue-tinted colors
 */

// Font sizes - standard Ant Design defaults
export const fontSize = {
  xs: '12px',      // Extra small
  sm: '12px',      // Small
  base: '14px',    // Base - standard body text
  md: '16px',      // Medium
  lg: '16px',      // Large
  xl: '20px',      // Extra large
  xxl: '24px',     // 2x large
};

// Font weights
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

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

/**
 * Get Ant Design theme configuration
 * @param {boolean} isDark - Whether dark mode is enabled
 */
export const getAntdTheme = (isDark) => {
  const themeColors = isDark ? colors.dark : colors.light;

  return {
    token: {
      // Font sizes - standard defaults
      fontSize: 14,           // Base font size
      fontSizeSM: 12,         // Small
      fontSizeLG: 16,         // Large
      fontSizeXL: 20,         // Extra large
      fontSizeHeading1: 38,   // H1
      fontSizeHeading2: 30,   // H2
      fontSizeHeading3: 24,   // H3
      fontSizeHeading4: 20,   // H4
      fontSizeHeading5: 16,   // H5

      // Colors
      colorBgBase: themeColors.bg.primary,
      colorBgContainer: themeColors.bg.secondary,
      colorBgElevated: isDark ? themeColors.bg.elevated : themeColors.bg.secondary,
      colorBorder: themeColors.border.primary,
      colorText: themeColors.text.primary,
      colorTextSecondary: themeColors.text.secondary,
      colorTextTertiary: themeColors.text.tertiary,

      // Border radius
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,
    },
    components: {
      Button: {
        fontSize: 14,
        fontSizeLG: 16,
        fontSizeSM: 12,
      },
      Input: {
        fontSize: 14,
        fontSizeLG: 16,
        fontSizeSM: 12,
      },
      Select: {
        fontSize: 14,
        fontSizeLG: 16,
        fontSizeSM: 12,
      },
      Table: {
        fontSize: 14,
        fontSizeSM: 12,
      },
      Card: {
        fontSize: 14,
      },
      Statistic: {
        titleFontSize: 14,
        contentFontSize: 20,
      },
    },
  };
};
