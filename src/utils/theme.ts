// Theme configuration for the app

export const colors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  border: '#DFE6E9',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F39C12',
  info: '#3498DB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSizes: {
    small: 12,
    body: 16,
    title: 20,
    header: 24,
    large: 32,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  typography,
  shadows,
};