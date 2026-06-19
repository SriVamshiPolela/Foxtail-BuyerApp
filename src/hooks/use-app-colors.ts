import { useColorScheme } from '@/hooks/use-color-scheme';

const LIGHT = {
  bg:              '#ffffff',
  bgScreen:        '#f5f5f7',
  bgMuted:         '#f9fafb',
  bgSubtle:        '#f3f4f6',
  border:          '#e5e7eb',
  borderLight:     '#f3f4f6',
  borderMid:       '#d1d5db',
  text:            '#111827',
  textSub:         '#374151',
  textMuted:       '#6b7280',
  textFaint:       '#9ca3af',
  primary:         '#c75a28',
  primaryBg:       '#fff7f5',
  primaryBgStrong: '#fce7d9',
  primaryText:     '#9a3412',
  primaryBorder:   '#fdc9b0',
  primaryLight:    '#fb923c',
  errorBg:         '#fff5f5',
  errorBorder:     '#fca5a5',
  errorText:       '#dc2626',
  errorTextDark:   '#991b1b',
  warningBg:       '#fffbeb',
  warningText:     '#92400e',
  warningTextDark: '#78350f',
  warningBorder:   '#fde68a',
};

const DARK = {
  bg:              '#1c1c1e',
  bgScreen:        '#000000',
  bgMuted:         '#2c2c2e',
  bgSubtle:        '#3a3a3c',
  border:          '#38383a',
  borderLight:     '#2c2c2e',
  borderMid:       '#48484a',
  text:            '#ffffff',
  textSub:         '#e5e5ea',
  textMuted:       '#8e8e93',
  textFaint:       '#636366',
  primary:         '#c75a28',
  primaryBg:       '#1f0e08',
  primaryBgStrong: '#2d1509',
  primaryText:     '#fb923c',
  primaryBorder:   '#7c2d12',
  primaryLight:    '#fdba74',
  errorBg:         '#2d0a0a',
  errorBorder:     '#7f1d1d',
  errorText:       '#f87171',
  errorTextDark:   '#fca5a5',
  warningBg:       '#1c1000',
  warningText:     '#fbbf24',
  warningTextDark: '#f59e0b',
  warningBorder:   '#92400e',
};

export type AppColors = typeof LIGHT;

export function useAppColors(): AppColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}
