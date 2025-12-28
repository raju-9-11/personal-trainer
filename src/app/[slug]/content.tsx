'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Transformations } from '@/components/sections/transformations';
import { Classes } from '@/components/sections/classes';
import { SocialFeed } from '@/components/sections/social-feed';
import { Contact } from '@/components/sections/contact';
import { useData } from '@/lib/data-provider';
import { BrandIdentity } from '@/lib/types';

const TrainerContext = createContext<string>("");

export const useTrainerSlug = () => useContext(TrainerContext);

export function TrainerPageContent({ slug }: { slug: string }) {
  const { getBrandIdentity } = useData();
  const [brand, setBrand] = useState<BrandIdentity | null>(null);

  useEffect(() => {
      // Assuming individual trainers might override brand identity in future?
      // For now, prompt implies global identity or trainer specific?
      // User said "global identity" is missing.
      // Usually individual pages use the global brand unless white-labeled per trainer.
      // Let's fetch 'platform' identity or the trainer's identity if we had that structure.
      // Current architecture: `getBrandIdentity(slug)` fetches for that trainer (or platform if 'platform').
      // If we are on `/trainer1`, we should fetch `trainer1`'s brand identity.
      getBrandIdentity(slug).then(setBrand);
  }, [getBrandIdentity, slug]);

  const brandName = brand?.brandName || "Titan Fitness";

  return (
    <TrainerContext.Provider value={slug}>
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
    </TrainerContext.Provider>
  );
}
