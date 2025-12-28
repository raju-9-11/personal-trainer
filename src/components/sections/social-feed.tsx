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

        {/* Instagram Grid - Dynamic to # of links */}
        {instagramLinks.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <Instagram className="text-primary" /> Latest Posts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {instagramLinks.map((link, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square bg-muted rounded-xl overflow-hidden relative group cursor-pointer"
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                           <span className="text-white text-xs font-bold">View on Instagram</span>
                        </div>
                        {/* Placeholder Image */}
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                           POST {idx + 1}
                        </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
        )}

        {/* YouTube Grid - Dynamic to # of links */}
        {youtubeLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <Youtube className="text-primary" /> Recent Training Videos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {youtubeLinks.map((link, idx) => (
                  <Card key={idx} className="aspect-video bg-black rounded-xl overflow-hidden relative group cursor-pointer border-none">
                     <a href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                               <Play className="h-6 w-6 text-black fill-black ml-1" />
                            </div>
                         </div>
                         {/* Placeholder Thumbnail */}
                         <div className="w-full h-full bg-muted/20" />
                     </a>
                  </Card>
                ))}
              </div>
            </div>
        )}
      </div>
    </section>
  );
}
