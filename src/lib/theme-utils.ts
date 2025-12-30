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

export function generatePalette(baseColor: string, secondaryOverride?: string): DualThemePalette {
  const base = colord(baseColor);
  const secondaryBase = secondaryOverride ? colord(secondaryOverride) : null;
  
  // --- Light Mode Palette ---
  // Background is usually White (#ffffff)
  let lightPrimary = base;
  if (lightPrimary.contrast('#ffffff') < 3) {
    while (lightPrimary.contrast('#ffffff') < 3 && lightPrimary.isLight()) {
        lightPrimary = lightPrimary.darken(0.1);
    }
  }

  let lightSecondary = secondaryBase || lightPrimary.mix('#ffffff', 0.1);
  if (lightSecondary.contrast('#ffffff') < 3) {
     while (lightSecondary.contrast('#ffffff') < 3 && lightSecondary.isLight()) {
         lightSecondary = lightSecondary.darken(0.1);
     }
  }
  
  const lightPalette: ThemePalette = {
    primary: lightPrimary.toHex(),
    primaryForeground: lightPrimary.isDark() ? '#ffffff' : '#000000',
    secondary: lightSecondary.toHex(),
    secondaryForeground: lightSecondary.isDark() ? '#ffffff' : '#000000',
    accent: lightPrimary.rotate(180).toHex(),
    accentForeground: colord(lightPrimary.rotate(180)).isDark() ? '#ffffff' : '#000000',
  };

  // --- Dark Mode Palette ---
  // Background is usually Dark (#000000 or very dark slate)
  let darkPrimary = base;
  if (darkPrimary.contrast('#000000') < 3) {
    while (darkPrimary.contrast('#000000') < 3 && darkPrimary.isDark()) {
        darkPrimary = darkPrimary.lighten(0.1);
    }
    if (darkPrimary.contrast('#000000') < 3) {
        darkPrimary = colord('#ffffff'); 
    }
  }

  // For dark mode secondary:
  // If override provided, use it (and ensure contrast).
  // If NOT provided, we previously mixed with black.
  let darkSecondary = secondaryBase || darkPrimary.mix('#000000', 0.6);
  
  // Ensure contrast for secondary in dark mode
  if (darkSecondary.contrast('#000000') < 3) {
      while (darkSecondary.contrast('#000000') < 3 && darkSecondary.isDark()) {
          darkSecondary = darkSecondary.lighten(0.1);
      }
      if (darkSecondary.contrast('#000000') < 3) {
        darkSecondary = colord('#94a3b8'); // Slate-400 fallback
      }
  }

  const darkPalette: ThemePalette = {
    primary: darkPrimary.toHex(),
    primaryForeground: darkPrimary.isDark() ? '#ffffff' : '#000000',
    secondary: darkSecondary.toHex(),
    secondaryForeground: darkSecondary.isDark() ? '#ffffff' : '#000000',
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
