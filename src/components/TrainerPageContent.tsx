import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Transformations } from '@/components/sections/transformations';
import { Classes } from '@/components/sections/classes';
import { SocialFeed } from '@/components/sections/social-feed';
import { Contact } from '@/components/sections/contact';
import { useData } from '@/lib/data-provider';
import { BrandIdentity } from '@/lib/types';
import { DEFAULT_BRAND_NAME } from '@/lib/constants';
import { TrainerContext, BrandIdentityContext } from '@/components/TrainerContext';
import { BootLoader } from '@/components/ui/boot-loader';
import { generatePalette, hexToOklch } from '@/lib/theme-utils';

export function TrainerPageContent({ slug }: { slug: string }) {
  const { getBrandIdentity } = useData();
  const [brand, setBrand] = useState<BrandIdentity | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setBrandLoading(true);
    // Fetch identity for the specific trainer slug
    getBrandIdentity(slug)
      .then((identity) => {
        if (!isActive) return;
        setBrand(identity);

        // Dynamic CSS Variables Injection
        if (identity) {
          const root = document.documentElement;
          const baseColor = identity.baseColor || identity.primaryColor;

          if (baseColor) {
              const palette = generatePalette(baseColor);

              // We need to inject these as OKLCH values ideally if we want transparency to work perfectly with Tailwind v4,
              // but since our generatePalette returns HEX, we will try to use hex directly.
              // Note: Tailwind v4 variables in globals.css use oklch(...) syntax.
              // Overriding them with HEX might break opacity modifiers (bg-primary/50).
              // Ideally we should convert HEX to OKLCH channels.
              // For now, let's inject them as is and see. If opacity breaks, we will need a converter.
              // Update: globals.css uses `oklch(var(--primary))` so the variable MUST be channels or a full color?
              // Actually globals.css defines: --primary: oklch(0.21 0.006 285.885);
              // So the variable holds the full value "oklch(...)".
              // If we set --primary to "#ff0000", it should work for solid colors.

              // However, since we are overriding CSS variables defined in `@theme` or `:root`,
              // we should try to match the format if we want consistency.
              // But since we are replacing the WHOLE value, a HEX string is valid CSS for a color property.

              root.style.setProperty('--primary', palette.primary);
              root.style.setProperty('--primary-foreground', palette.primaryForeground);

              root.style.setProperty('--secondary', palette.secondary);
              root.style.setProperty('--secondary-foreground', palette.secondaryForeground);

              root.style.setProperty('--accent', palette.accent);
              root.style.setProperty('--accent-foreground', palette.accentForeground);

              // We can also tweak ring/border to match primary for a cohesive look
              root.style.setProperty('--ring', palette.primary);
          }
        }

        // Add a small artificial delay for the boot sequence to be visible and smooth
        setTimeout(() => {
            if (isActive) setBrandLoading(false);
        }, 1500);
      })
      .catch(() => {
        if (!isActive) return;
        setBrand(null);
        setBrandLoading(false);
      });
    return () => {
      isActive = false;
      // Reset variables on cleanup to ensure they don't leak to other pages or trainers
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--ring');
    };
  }, [getBrandIdentity, slug]);

  useEffect(() => {
    if (!brandLoading && brand?.brandName) {
      document.title = `${brand.brandName} | ${slug}`;
    } else if (!brandLoading) {
      document.title = `${DEFAULT_BRAND_NAME} | ${slug}`;
    }
  }, [brand, brandLoading, slug]);

  const brandName = brand?.brandName || (brandLoading ? '' : DEFAULT_BRAND_NAME);

  return (
    <TrainerContext.Provider value={slug}>
      <BrandIdentityContext.Provider value={{ identity: brand, loading: brandLoading }}>
        <AnimatePresence>
            {brandLoading && <BootLoader message={brand?.brandName ? `Loading ${brand.brandName}` : `Loading Profile...`} />}
        </AnimatePresence>

        {!brandLoading && (
            <>
                <Navbar />
                <Hero />
                <About />
                <Transformations />
                <Classes />
                <SocialFeed />
                <Contact />

                <footer className="py-8 bg-background border-t border-border/50 text-center text-muted-foreground text-sm">
                  <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
                </footer>
            </>
        )}
      </BrandIdentityContext.Provider>
    </TrainerContext.Provider>
  );
}
