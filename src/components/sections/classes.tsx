'use client';

import { useData } from '@/lib/data-provider';
import { GymClass } from '@/lib/types';
import { useTrainerSlug } from '@/components/TrainerContext';
import { useEffect, useState, useCallback } from 'react';
import { BookingModal } from '@/components/ui/booking-modal';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ClassCard } from './class-card';

export function Classes() {
  const { getClasses } = useData();
  const slug = useTrainerSlug();
  const [items, setItems] = useState<GymClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);

  const handleSelect = useCallback((item: GymClass) => {
    setSelectedClass(item);
  }, []);

  useEffect(() => {
    if (slug) {
      getClasses(slug).then((data) => {
        const now = new Date();
        const upcoming = data.filter(c => {
          if (c.dateIso) {
            return new Date(c.dateIso) > now;
          }
          return false;
        });
        // Sort by date
        upcoming.sort((a, b) => {
          const dateA = a.dateIso ? new Date(a.dateIso).getTime() : 0;
          const dateB = b.dateIso ? new Date(b.dateIso).getTime() : 0;
          return dateA - dateB;
        });
        setItems(upcoming);
      });
    }
  }, [getClasses, slug]);

  return (
    <section id="classes" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase mb-4">Class Schedule</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our high-energy group sessions designed to push your limits.
          </p>
        </div>

        {items.length > 0 ? (
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-4">
            {items.map((item, idx) => (
              <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3 p-4">
                <ClassCard
                  item={item}
                  index={idx}
                  onSelect={handleSelect}
                />
              </CarouselItem>
            ))}
            </CarouselContent>
            <div className="hidden md:flex justify-end gap-2 mt-4">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center py-12 bg-muted/10 border border-border rounded-lg max-w-2xl mx-auto">
            <p className="text-muted-foreground text-lg">No upcoming classes scheduled. Check back soon!</p>
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
