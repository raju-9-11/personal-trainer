'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Instagram, Youtube, Facebook, Twitter, Globe, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-provider';
import { useEffect, useState } from 'react';
import { TrainerProfile, SocialLink } from '@/lib/types';
import { useTrainerSlug } from '@/components/TrainerContext';
import ReactPlayer from 'react-player';

// Switch to main import to avoid build resolution issues

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

  const getLinksByPlatform = (platform: SocialLink['platform']) => {
      if (!profile) return [];
      const links = profile.socialLinks?.filter(link => link.platform === platform) || [];

      // Legacy Fallback
      if (links.length === 0) {
          if (platform === 'instagram' && profile.instagramUrl) return [{ platform: 'instagram', url: profile.instagramUrl }];
          if (platform === 'youtube' && profile.youtubeUrl) return [{ platform: 'youtube', url: profile.youtubeUrl }];
      }
      return links;
  };

  const instagramLinks = getLinksByPlatform('instagram');
  const youtubeLinks = getLinksByPlatform('youtube');

  // Use profile specific URLs for the profile buttons if available, otherwise fallback to the first link found
  // However, usually "instagramUrl" on profile is the profile link, and socialLinks are posts.
  // We will assume profile.instagramUrl is the profile link.
  const instagramProfileLink = profile?.instagramUrl || (instagramLinks.length > 0 ? instagramLinks[0].url : '');
  const youtubeProfileLink = profile?.youtubeUrl || (youtubeLinks.length > 0 ? youtubeLinks[0].url : '');

  useEffect(() => {
    if (instagramLinks.length === 0) return;
    if (typeof window === 'undefined') return;

    const processEmbeds = () => {
      if (typeof window !== 'undefined' && (window as any).instgrm?.Embeds?.process) {
        (window as any).instgrm.Embeds.process();
      }
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.instagram.com/embed.js"]');
    if (existing) {
      processEmbeds();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = processEmbeds;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [instagramLinks]);

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div>
             <h2 className="text-4xl font-black uppercase mb-2">Connect</h2>
             <p className="text-muted-foreground">Follow the journey</p>
           </div>
           <div className="flex flex-wrap gap-4">
             {instagramProfileLink && (
               <Button variant="outline" className="gap-2" asChild>
                 <a href={instagramProfileLink} target="_blank" rel="noopener noreferrer">
                   <Instagram className="h-4 w-4" /> Instagram
                 </a>
               </Button>
             )}
             {youtubeProfileLink && (
               <Button variant="outline" className="gap-2" asChild>
                 <a href={youtubeProfileLink} target="_blank" rel="noopener noreferrer">
                   <Youtube className="h-4 w-4" /> YouTube
                 </a>
               </Button>
             )}
           </div>
        </div>

        {/* Instagram Grid - Dynamic to # of links */}
        {instagramLinks.length > 0 && (
            <div className="mb-12 flex flex-col text-left">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <Instagram className="text-primary" /> Latest Posts
              </h3>
              <div className="flex flex-wrap justify-center gap-6 w-full">
                {instagramLinks.map((link, idx) => {
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="bg-card rounded-xl overflow-hidden relative group cursor-pointer max-w-[320px] w-full border border-border shadow-md"
                    >
                      <div className="w-full bg-background relative rounded-xl overflow-hidden p-2">
                        <blockquote
                          className="instagram-media w-full"
                          data-instgrm-permalink={link.url}
                          data-instgrm-version="14"
                          style={{
                            minWidth: '300px',
                            width: '100%',
                            background: 'white', // Instagram iframe usually expects white background
                            border: 0,
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                            Loading post...
                          </div>
                        </blockquote>
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-center">
                           <span className="text-white text-xs font-bold tracking-widest">View on Instagram</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
        )}

        {/* YouTube Grid - Dynamic to # of links */}
        {youtubeLinks.length > 0 && (
            <div className="flex flex-col text-left">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <Youtube className="text-primary" /> Recent Training Videos
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {youtubeLinks.map((link, idx) => {
                  return (
                    <Card key={idx} className="w-full aspect-video bg-black rounded-xl overflow-hidden relative border-none shadow-lg">
                       <ReactPlayer
                          // @ts-ignore
                          url={link.url}
                          width="100%"
                          height="100%"
                          controls
                          light={false} // Disabled light mode to ensure player loads if thumbnail fails
                        />
                    </Card>
                  );
                })}
              </div>
            </div>
        )}
      </div>
    </section>
  );
}
