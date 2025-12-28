'use client';

import { useData } from '@/lib/data-provider';
import { GymClass } from '@/lib/types';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTrainerSlug } from '@/app/trainer/content';

export function Classes() {
  const { getClasses } = useData();
  const slug = useTrainerSlug();
  const [items, setItems] = useState<GymClass[]>([]);

  useEffect(() => {
    if (slug) {
      getClasses(slug).then(setItems);
    }
  }, [getClasses, slug]);

  return (
    <section id="classes" className="py-24 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase mb-4">Class Schedule</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our high-energy group sessions designed to push your limits.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full flex flex-col border-border/50 hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="mb-2">{item.time.split(' ')[0]}</Badge>
                      <Badge variant={item.enrolledSpots >= item.maxSpots ? "destructive" : "outline"}>
                        {item.enrolledSpots >= item.maxSpots ? "FULL" : `${item.maxSpots - item.enrolledSpots} Spots Left`}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4 text-primary" />
                      {item.time} ({item.durationMinutes} mins)
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4 text-primary" />
                      Capacity: {item.maxSpots}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={item.enrolledSpots >= item.maxSpots}>
                      {item.enrolledSpots >= item.maxSpots ? "Join Waitlist" : "Book Class"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No classes scheduled yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
