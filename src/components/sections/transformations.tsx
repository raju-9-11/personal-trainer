'use client';

import { useData } from '@/lib/data-provider';
import { Transformation } from '@/lib/types';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useTrainerSlug } from '@/app/trainer/content';

export function Transformations() {
  const { getTransformations } = useData();
  const slug = useTrainerSlug();
  const [items, setItems] = useState<Transformation[]>([]);

  useEffect(() => {
    if (slug) {
      getTransformations(slug).then(setItems);
    }
  }, [getTransformations, slug]);

  if (items.length === 0) return null;

  return (
    <section id="transformations" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase mb-4">Real Results</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See the incredible transformations achieved by people just like you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden border-border/50 h-full">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-0.5 bg-border">
                    <div className="relative aspect-[3/4] group">
                       {/* Placeholder for real images */}
                       <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground font-bold">BEFORE</div>
                       <img src={item.beforeImage} alt="Before" className="w-full h-full object-cover relative z-10" />
                    </div>
                    <div className="relative aspect-[3/4] group">
                       <div className="absolute inset-0 bg-primary/20 flex items-center justify-center text-primary font-bold">AFTER</div>
                       <img src={item.afterImage} alt="After" className="w-full h-full object-cover relative z-10" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{item.clientName}</h3>
                      <div className="bg-primary/10 text-primary p-2 rounded-full">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
