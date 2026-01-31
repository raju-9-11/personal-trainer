import { GymClass } from '@/lib/types';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { memo } from 'react';

interface ClassCardProps {
  item: GymClass;
  index: number;
  onBook: (item: GymClass) => void;
}

export const ClassCard = memo(function ClassCard({ item, index, onBook }: ClassCardProps) {
  const isFull = item.enrolledSpots >= item.maxSpots;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`h-full ${isFull ? 'opacity-80' : ''}`}
    >
      <Card className={`h-full flex flex-col bg-background/50 border border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] dark:bg-white/[0.03] dark:backdrop-blur-md ${isFull ? '' : 'shadow-sm'}`}>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit bg-background/80 border border-border/50 text-foreground/80 font-semibold shadow-xs backdrop-blur-sm">{item.time.split(' ')[0]}</Badge>
              <CountdownTimer targetDate={item.dateIso || new Date().toISOString()} />
            </div>
            <Badge variant={isFull ? "destructive" : "outline"}>
              {isFull ? "FULL" : `${item.maxSpots - item.enrolledSpots} Spots Left`}
            </Badge>
          </div>
          <CardTitle className="text-xl">{item.title}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center text-sm font-medium">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            {item.time} ({item.durationMinutes} mins)
          </div>
          <div className="flex items-center text-sm font-medium">
            <Users className="mr-2 h-4 w-4 text-primary" />
            Capacity: {item.maxSpots}
          </div>
          <div className="flex items-center text-sm font-medium">
            Price: {item.price ? `$${item.price}` : 'Free'}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={isFull}
            onClick={() => onBook(item)}
          >
            {isFull ? "Join Waitlist" : "Book Class"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
});
