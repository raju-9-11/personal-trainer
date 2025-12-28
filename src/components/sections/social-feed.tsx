'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Instagram, Youtube, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SocialFeed() {
  // Mock Data for Social Media
  const instaPosts = [1, 2, 3, 4];
  const youtubeVideos = [1, 2];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div>
             <h2 className="text-4xl font-black uppercase mb-2">Social Hype</h2>
             <p className="text-muted-foreground">Follow the journey on Instagram & YouTube</p>
           </div>
           <div className="flex gap-4">
             <Button variant="outline" className="gap-2">
               <Instagram className="h-4 w-4" /> @titanfitness
             </Button>
             <Button variant="outline" className="gap-2">
               <Youtube className="h-4 w-4" /> TitanTV
             </Button>
           </div>
        </div>

        {/* Instagram Grid */}
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <Instagram className="text-primary" /> Latest Posts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instaPosts.map((post) => (
              <motion.div
                key={post}
                whileHover={{ scale: 1.05 }}
                className="aspect-square bg-muted rounded-xl overflow-hidden relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <span className="text-white text-xs font-bold">View on Instagram</span>
                </div>
                {/* Placeholder Image */}
                <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                   POST {post}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* YouTube Grid */}
        <div>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <Youtube className="text-primary" /> Recent Training Videos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {youtubeVideos.map((video) => (
              <Card key={video} className="aspect-video bg-black rounded-xl overflow-hidden relative group cursor-pointer border-none">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Play className="h-6 w-6 text-black fill-black ml-1" />
                    </div>
                 </div>
                 {/* Placeholder Thumbnail */}
                 <div className="w-full h-full bg-muted/20" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
