'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Instagram, Youtube, Facebook, Twitter, Globe, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-provider';
import { useEffect, useState } from 'react';
import { TrainerProfile, SocialLink } from '@/lib/types';
import { useTrainerSlug } from '@/app/[slug]/content';

export function SocialFeed() {
  const { getProfile } = useData();
  const slug = useTrainerSlug();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);

  useEffect(() => {
    if (slug) {
      getProfile(slug).then(setProfile);
    }
  }, [getProfile, slug]);

  const getIcon = (platform: SocialLink['platform']) => {
      switch(platform) {
          case 'instagram': return <Instagram className="h-4 w-4" />;
          case 'youtube': return <Youtube className="h-4 w-4" />;
          case 'facebook': return <Facebook className="h-4 w-4" />;
          case 'twitter': return <Twitter className="h-4 w-4" />;
          default: return <Globe className="h-4 w-4" />;
      }
  };

  const getLabel = (platform: SocialLink['platform']) => {
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div>
             <h2 className="text-4xl font-black uppercase mb-2">Connect</h2>
             <p className="text-muted-foreground">Follow the journey</p>
           </div>
           <div className="flex flex-wrap gap-4">
             {profile?.socialLinks?.map((link, idx) => (
                 <Button key={idx} variant="outline" className="gap-2" asChild>
                   <a href={link.url} target="_blank" rel="noopener noreferrer">
                     {getIcon(link.platform)} {getLabel(link.platform)}
                   </a>
                 </Button>
             ))}
             {/* Fallback for legacy fields if no socialLinks */}
             {(!profile?.socialLinks || profile.socialLinks.length === 0) && (
                 <>
                    {profile?.instagramUrl && (
                        <Button variant="outline" className="gap-2" asChild>
                           <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">
                             <Instagram className="h-4 w-4" /> Instagram
                           </a>
                        </Button>
                    )}
                    {profile?.youtubeUrl && (
                        <Button variant="outline" className="gap-2" asChild>
                           <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer">
                             <Youtube className="h-4 w-4" /> YouTube
                           </a>
                        </Button>
                    )}
                 </>
             )}
           </div>
        </div>

        {/* We keep the mock posts/videos grid below or remove it?
            The requirement was "Option to link instagram links and youtube links".
            It didn't explicitly say "remove the feed preview".
            However, without an API connection to IG/YT, the feed preview was always mock.
            Let's leave the mock preview for visual fullness, or hide it if no links?
            Let's leave it as "Latest Posts" but maybe it's confusing if it's not real.
            For now, I will keep the section structure but it's just static mock.
        */}
      </div>
    </section>
  );
}
