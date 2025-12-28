'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useData } from '@/lib/data-provider';
import { TrainerSummary } from '@/lib/types';

export default function Home() {
  const { getTrainers } = useData();
  const [trainers, setTrainers] = useState<TrainerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrainers().then(data => {
      setTrainers(data);
      setLoading(false);
    });
  }, [getTrainers]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)' }}
        />

        <div className="relative z-20 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            FIND YOUR <span className="text-primary">TITAN</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Elite personal trainers ready to help you shatter your limits. Choose your coach and start your journey today.
          </p>
          <a href="#trainers" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full text-lg font-semibold transition-all">
            Browse Trainers
          </a>
        </div>
      </section>

      {/* Trainers Grid */}
      <section id="trainers" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Elite Coaches</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainers.map((trainer) => (
                <Link key={trainer.slug} href={`/${trainer.slug}`} className="group relative block overflow-hidden rounded-2xl aspect-[3/4]">
                  <div className="absolute inset-0 bg-gray-900" />
                  {/* Placeholder image logic if no image provided */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                    style={{ backgroundImage: `url(${trainer.profileImage || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop'})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-3xl font-bold text-white mb-2">{trainer.name}</h3>
                    <p className="text-primary font-medium tracking-widest uppercase text-sm">{trainer.heroTitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-white/10 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Titan Fitness Platform. All rights reserved.</p>
      </footer>
    </main>
  );
}
