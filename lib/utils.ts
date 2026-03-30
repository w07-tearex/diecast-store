
// Common Tailwind classes
export const SHADOWS = {
  glow: 'drop-shadow-[0_0_15px_rgba(255,66,176,0.5)]',
  glowLarge: 'shadow-[0_0_30px_rgba(251,146,60,0.5)]',
  glowRed: 'shadow-[0_0_15px_rgba(220,38,38,0.5)]',
}

export const COLORS = {
  primary: '#FF42B0',
  primaryDark: '#D42A7B',
  dark: '#0d1117',
  darkBg: '#0b0d17',
}

export const formatVND = (amount: number | string | null | undefined): string => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};

// Formats a number for INPUT fields (no ₫ suffix, using commas as thousands separator)
export const formatVNDInput = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? value.replace(/\D/g, '') : Math.floor(Number(value)).toString();
  if (num === '') return '';
  return new Intl.NumberFormat('en-US').format(parseInt(num, 10));
};

// Parses a formatted string back to a numeric string for storage
export const parseVNDInput = (formattedValue: string): string => {
    return formattedValue.replace(/\D/g, '');
};
