'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useData } from '@/lib/data-provider';
import { useEffect, useState } from 'react';
import { TrainerProfile } from '@/lib/types';
import { useTrainerSlug } from '@/app/[slug]/content';

export function Hero() {
  const { getProfile } = useData();
  const slug = useTrainerSlug();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);

  useEffect(() => {
    if (slug) {
      getProfile(slug).then(setProfile);
    }
  }, [getProfile, slug]);

  if (!profile) return <div className="h-screen bg-background flex items-center justify-center">Loading...</div>;

  const getExperienceString = () => {
      const years = profile.experienceYears || 0;
      const months = profile.experienceMonths || 0;
      if (years === 0 && months === 0) return null;
      let text = "";
      if (years > 0) text += `${years} Year${years > 1 ? 's' : ''}`;
      if (months > 0) text += ` ${months} Month${months > 1 ? 's' : ''}`;
      return text + " Experience";
  };

  const getClientsString = () => {
      let count = profile.clientsHandled || 0;
      if (count === 0) return null;
      if (profile.clientsHandledRounded) {
          count = Math.floor(count / 10) * 10;
          return `${count}+ Clients Handled`;
      }
      return `${count} Clients Handled`;
  };

  const stats = [getExperienceString(), getClientsString()].filter(Boolean);

  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Graphic Element - Energetic Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 z-10 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-primary uppercase tracking-widest mb-4">
            {profile.heroSubtitle}
          </h2>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6"
        >
          {profile.heroTitle}
        </motion.h1>

        {stats.length > 0 && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex gap-4 md:gap-8 mb-6 text-sm md:text-lg font-bold uppercase tracking-wider text-muted-foreground"
            >
                {stats.map((stat, idx) => (
                    <span key={idx} className="border border-primary/30 px-3 py-1 rounded-full">{stat}</span>
                ))}
            </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
        >
          {profile.bio.substring(0, 100)}...
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <Button size="lg" className="text-lg px-8 py-6 rounded-full" asChild>
            <Link href={`/${slug}#contact`}>Start Your Journey</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full" asChild>
            <Link href={`/${slug}#classes`}>View Classes</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
