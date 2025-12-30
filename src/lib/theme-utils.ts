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

export function generatePalette(baseColor: string): ThemePalette {
  const base = colord(baseColor);
  const isDark = base.isDark();

  // Generate Primary
  const primary = base.toHex();
  const primaryForeground = base.isDark() ? '#ffffff' : '#000000';

  // Generate Secondary (Complementary or Analogous)
  // Let's use a tint/shade of the primary for a monochromatic professional look,
  // or a very subtle mix for secondary.
  const secondary = base.mix(isDark ? '#ffffff' : '#000000', 0.1).toHex();
  const secondaryForeground = colord(secondary).isDark() ? '#ffffff' : '#000000';

  // Generate Accent (Complementary)
  const accent = base.rotate(180).toHex();
  const accentForeground = colord(accent).isDark() ? '#ffffff' : '#000000';

  return {
    primary,
    primaryForeground,
    secondary,
    secondaryForeground,
    accent,
    accentForeground,
  };
}

export function hexToOklch(hex: string): string {
    // Tailwind v4 uses OKLCH. We need to convert hex to the specific format "L C H"
    // colord doesn't support OKLCH output natively in the format Tailwind usually expects ("l c h"),
    // but we can approximate or just set the hex directly in the style property if we change how we inject it.
    // However, globals.css uses `oklch(...)`.
    // To be safe and simple, we might just override the variable with the HEX value if the browser supports it in the variable,
    // OR we can rely on `color-mix` or similar.
    // Actually, Tailwind variables in the `@theme` block in globals.css seem to expect specific formats if used with `<alpha-value>`.
    // But if we just set `--primary: #hex`, standard CSS works fine.
    // The issue is if Tailwind classes use `bg-primary/50`. If `--primary` is a hex, `bg-primary/50` might not work automatically
    // unless defined with `@color` in newer CSS or using `rgb` components.

    // Let's try to stick to hex for simplicity first, as modern browsers and Tailwind v4 often handle it well
    // if configured correctly, or we fallback to RGB.
    // For robust "slash opacity" support (e.g. text-primary/50), we usually need the color values to be strictly the channels.

    // Let's assume for now we will inject HEX and see if it breaks transparency modifiers.
    // If it does, we will convert to HSL or RGB channels.
    return hex;
}
