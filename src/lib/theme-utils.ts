import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import mixPlugin from 'colord/plugins/mix';

extend([a11yPlugin, mixPlugin]);

export interface ThemePalette {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background?: string; // Optional override
  foreground?: string;
}

export interface DualThemePalette {
  light: ThemePalette;
  dark: ThemePalette;
}

export function generatePalette(baseColor: string): DualThemePalette {
  const base = colord(baseColor);
  
  // --- Light Mode Palette ---
  // Background is usually White (#ffffff)
  let lightPrimary = base;
  if (lightPrimary.contrast('#ffffff') < 3) {
    // If too light for white bg, darken it
    // e.g. Yellow -> Darker Gold
    while (lightPrimary.contrast('#ffffff') < 3 && lightPrimary.isLight()) {
        lightPrimary = lightPrimary.darken(0.1);
    }
  }
  
  const lightPalette: ThemePalette = {
    primary: lightPrimary.toHex(),
    primaryForeground: lightPrimary.isDark() ? '#ffffff' : '#000000',
    secondary: lightPrimary.mix('#ffffff', 0.1).toHex(),
    secondaryForeground: colord(lightPrimary.mix('#ffffff', 0.1)).isDark() ? '#ffffff' : '#000000',
    accent: lightPrimary.rotate(180).toHex(),
    accentForeground: colord(lightPrimary.rotate(180)).isDark() ? '#ffffff' : '#000000',
  };

  // --- Dark Mode Palette ---
  // Background is usually Dark (#000000 or very dark slate)
  let darkPrimary = base;
  if (darkPrimary.contrast('#000000') < 3) {
    // If too dark for black bg, lighten it
    // e.g. Navy Blue -> Sky Blue
    // e.g. Black -> Grey -> White
    while (darkPrimary.contrast('#000000') < 3 && darkPrimary.isDark()) {
        darkPrimary = darkPrimary.lighten(0.1);
    }
    // If it's still not enough (e.g. pure black didn't lighten enough or logic loop), force a minimum brightness
    if (darkPrimary.contrast('#000000') < 3) {
        darkPrimary = colord('#ffffff'); // Fallback to white if all else fails
    }
  }

  const darkPalette: ThemePalette = {
    primary: darkPrimary.toHex(),
    primaryForeground: darkPrimary.isDark() ? '#ffffff' : '#000000',
    // For dark mode secondary, we often want a dark surface color, not a mix of primary
    secondary: darkPrimary.mix('#000000', 0.6).toHex(),
    secondaryForeground: '#ffffff',
    accent: darkPrimary.rotate(180).toHex(),
    accentForeground: colord(darkPrimary.rotate(180)).isDark() ? '#ffffff' : '#000000',
  };

  return {
    light: lightPalette,
    dark: darkPalette
  };
}

export function hexToOklch(hex: string): string {
    return hex;
}
