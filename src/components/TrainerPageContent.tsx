import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Transformations } from '@/components/sections/transformations';
import { Classes } from '@/components/sections/classes';
import { SocialFeed } from '@/components/sections/social-feed';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/layout/footer';
import { useData } from '@/lib/data-provider';
import { BrandIdentity } from '@/lib/types';
import { DEFAULT_BRAND_NAME, MIN_BOOT_TIME_MS } from '@/lib/constants';
import { TrainerContext, BrandIdentityContext } from '@/components/TrainerContext';
import { BootLoader } from '@/components/ui/boot-loader';
import { generatePalette, hexToOklch } from '@/lib/theme-utils';
import { useTheme } from '@/components/ThemeContext';

export function TrainerPageContent({ slug }: { slug: string }) {
  const { getBrandIdentity } = useData();
  const { theme } = useTheme();
  const [brand, setBrand] = useState<BrandIdentity | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);

  // Effect 1: Fetch Brand Data
  useEffect(() => {
    let isActive = true;

    const fetchBrand = async () => {
        setBrandLoading(true);
        const startTime = Date.now();
        try {
            const identity = await getBrandIdentity(slug);
            if (!isActive) return;
            setBrand(identity);
        } catch (error) {
            if (!isActive) return;
            setBrand(null);
        } finally {
             const elapsed = Date.now() - startTime;
             const remaining = MIN_BOOT_TIME_MS - elapsed;
             if (remaining > 0) {
                 await new Promise(resolve => setTimeout(resolve, remaining));
             }
             if (isActive) setBrandLoading(false);
        }
    };

    fetchBrand();

    return () => {
      isActive = false;
    };
  }, [getBrandIdentity, slug]);

  // Effect 2: Apply Styles based on Brand and Theme
  useEffect(() => {
    if (!brand) return;

    const baseColor = brand.baseColor || brand.primaryColor;
    if (!baseColor) return;

    const root = document.documentElement;
    // Pass secondary color if available
    const palettes = generatePalette(baseColor, brand.secondaryColor);
    const palette = theme === 'dark' ? palettes.dark : palettes.light;

    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-foreground', palette.primaryForeground);

    root.style.setProperty('--secondary', palette.secondary);
    root.style.setProperty('--secondary-foreground', palette.secondaryForeground);

    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-foreground', palette.accentForeground);

    // We can also tweak ring/border to match primary for a cohesive look
    root.style.setProperty('--ring', palette.primary);

    return () => {
      // Reset variables on cleanup/unmount
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--ring');
    };
  }, [brand, theme]);


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
          {brandLoading && <BootLoader />}
        </AnimatePresence>
        {!brandLoading && (
          <div className={`min-h-screen bg-background font-sans text-foreground`}>
                <Navbar />
                <Hero />
                <About />
                <Transformations />
                <Classes />
                <SocialFeed />
                <Contact />
                <Footer />
          </div>
        )}
      </BrandIdentityContext.Provider>
    </TrainerContext.Provider>
  );
}
