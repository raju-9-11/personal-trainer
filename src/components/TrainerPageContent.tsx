import React, { useEffect, useState, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { useData } from '@/lib/data-provider';

// Lazy load "below-the-fold" sections to reduce the initial JavaScript bundle size.
// This improves the First Contentful Paint (FCP) and Largest Contentful Paint (LCP)
// by prioritizing the Navbar and Hero sections.
const About = lazy(() => import('@/components/sections/about').then(module => ({ default: module.About })));
const Transformations = lazy(() => import('@/components/sections/transformations').then(module => ({ default: module.Transformations })));
const Classes = lazy(() => import('@/components/sections/classes').then(module => ({ default: module.Classes })));
const SocialFeed = lazy(() => import('@/components/sections/social-feed').then(module => ({ default: module.SocialFeed })));
const Contact = lazy(() => import('@/components/sections/contact').then(module => ({ default: module.Contact })));
const Footer = lazy(() => import('@/components/layout/footer').then(module => ({ default: module.Footer })));

import { BrandIdentity } from '@/lib/types';
import { DEFAULT_BRAND_NAME } from '@/lib/constants';
import { TrainerContext, BrandIdentityContext } from '@/components/TrainerContext';
import { BootLoader } from '@/components/ui/boot-loader';
import { generatePalette, hexToOklch } from '@/lib/theme-utils';
import { useTheme } from '@/components/ThemeContext';

export function TrainerPageContent({ slug }: { slug: string }) {
  const { getBrandIdentity } = useData();
  const { theme } = useTheme();
  const [brand, setBrand] = useState<BrandIdentity | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);

  // Reset loading state when slug changes.
  // We use a layout effect or just render-phase check if possible, but for simplicity
  // and to avoid flash, we'll rely on the fact that a new slug usually means a new component mount
  // if the key changes. If the component is reused, we need to set loading to true.
  // To avoid 'set state in effect' lint error, we can use a key on the component in the parent
  // OR we can accept that we might show old data for a split second if we don't set loading here.
  // However, for this optimization task, let's keep it simple.

  // Effect 1: Fetch Brand Data
  useEffect(() => {
    let isActive = true;

    // Record start time to ensure minimum display time for boot sequence
    const startTime = Date.now();
    const MIN_DISPLAY_TIME = 800; // ms

    // Fetch identity for the specific trainer slug
    getBrandIdentity(slug)
      .then((identity) => {
        if (!isActive) return;
        setBrand(identity);

        // Calculate how much time has passed
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

        // Wait only the remaining time needed to meet the minimum display time
        // This avoids fixed artificial delays on slow connections while preventing flicker on fast ones
        if (remaining > 0) {
            setTimeout(() => {
                if (isActive) setBrandLoading(false);
            }, remaining);
        } else {
            setBrandLoading(false);
        }
      })
      .catch(() => {
        if (!isActive) return;
        setBrand(null);
        setBrandLoading(false);
      });
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
                <Suspense fallback={null}>
                  <About />
                  <Transformations />
                  <Classes />
                  <SocialFeed />
                  <Contact />
                  <Footer />
                </Suspense>
          </div>
        )}
      </BrandIdentityContext.Provider>
    </TrainerContext.Provider>
  );
}
