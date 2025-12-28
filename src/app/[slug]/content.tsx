'use client';

import React, { createContext, useContext } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Transformations } from '@/components/sections/transformations';
import { Classes } from '@/components/sections/classes';
import { SocialFeed } from '@/components/sections/social-feed';
import { Contact } from '@/components/sections/contact';

// We need a context to pass the slug down to the components so they can fetch the right data
// without refactoring every single component to take props.
// However, the `useData` hook is used inside them.
// We should update `useData` or create a `useTrainer` hook.

const TrainerContext = createContext<string>("");

export const useTrainerSlug = () => useContext(TrainerContext);

export function TrainerPageContent({ slug }: { slug: string }) {
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
        <p>&copy; {new Date().getFullYear()} Titan Fitness. All rights reserved.</p>
      </footer>
    </TrainerContext.Provider>
  );
}
