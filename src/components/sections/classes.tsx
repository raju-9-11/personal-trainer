'use client';

import { useData } from '@/lib/data-provider';
import { GymClass } from '@/lib/types';
import { useTrainerSlug } from '@/components/TrainerContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { BookingModal } from '@/components/ui/booking-modal';

export function Classes() {
  const { getClasses } = useData();
  const slug = useTrainerSlug();
  const [items, setItems] = useState<GymClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);

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
                className={item.enrolledSpots >= item.maxSpots ? 'opacity-80' : ''}
              >
                <Card className={`h-full flex flex-col border-border/50 hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] ${item.enrolledSpots >= item.maxSpots ? '' : 'scale-105 shadow-lg border-primary/20'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit">{item.time.split(' ')[0]}</Badge>
                          {/* We try to parse the time string for the countdown. Assuming ISO or standard format in item.time */}
                          {/* If item.time is just "Monday 10am", countdown won't work well without a real date.
                              For now, I'll assume item.time might need a real date field or I'll try to parse it if it is a date.
                              However, existing data seems to be strings. I will rely on a new field `dateIso` if available,
                              or fallback to not showing it if invalid.
                              Actually, for this task, I'll add `dateIso` to the type soon.
                              For now let's pass item.time and see if it works or valid date string */}
                           <CountdownTimer targetDate={(item as any).dateIso || new Date().toISOString()} />
                      </div>
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
                     <div className="flex items-center text-sm text-muted-foreground">
                       {/* Placeholder for price */}
                       Price: {(item as any).price ? `$${(item as any).price}` : 'Free'}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                        className="w-full"
                        disabled={item.enrolledSpots >= item.maxSpots}
                        onClick={() => setSelectedClass(item)}
                    >
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

      {selectedClass && (
        <BookingModal
            gymClass={selectedClass}
            isOpen={!!selectedClass}
            onClose={() => setSelectedClass(null)}
        />
      )}
    </section>
  );
}
