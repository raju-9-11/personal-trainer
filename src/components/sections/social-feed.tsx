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
  const instagramProfileLink = instagramLinks[0]?.url || profile?.instagramUrl || '';
  const youtubeProfileLink = youtubeLinks[0]?.url || profile?.youtubeUrl || '';

  const getYoutubeId = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.replace('/', '');
      }
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.searchParams.get('v')) {
          return parsed.searchParams.get('v');
        }
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments[0] === 'shorts' && segments[1]) {
          return segments[1];
        }
        const embedIndex = segments.findIndex(segment => segment === 'embed');
        if (embedIndex !== -1 && segments[embedIndex + 1]) {
          return segments[embedIndex + 1];
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const getYoutubeThumbnail = (url: string): string | null => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const getInstagramCode = (url: string): { type: 'p' | 'reel' | 'tv'; id: string } | null => {
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('instagram.com')) return null;
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length < 2) return null;
      const type = segments[0];
      const id = segments[1];
      if (['p', 'reel', 'tv'].includes(type) && id) {
        return { type: type as 'p' | 'reel' | 'tv', id };
      }
    } catch (e) {
      return null;
    }
    return null;
  };

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {instagramLinks.map((link, idx) => {
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="bg-muted rounded-xl overflow-hidden relative group cursor-pointer"
                    >
                      <div className="w-full bg-secondary relative rounded-xl overflow-hidden">
                        <blockquote
                          className="instagram-media w-full"
                          data-instgrm-permalink={link.url}
                          data-instgrm-version="14"
                          style={{
                            minWidth: '300px',
                            width: '100%',
                            background: '#fff',
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {youtubeLinks.map((link, idx) => {
                  const thumbnail = getYoutubeThumbnail(link.url);
                  return (
                    <Card key={idx} className="w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden relative group cursor-pointer border-none">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <div className="w-full h-full bg-muted/20 relative">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={`Training video preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                              Video {idx + 1}
                            </div>
                          )}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-black fill-black ml-1" />
                            </div>
                            <span className="text-xs uppercase tracking-wide text-white/80">Watch on YouTube</span>
                          </div>
                        </div>
                      </a>
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
