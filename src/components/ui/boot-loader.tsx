import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';

export function BootLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Dumbbell className="h-24 w-24 text-primary relative z-10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-black uppercase tracking-wider">
          {message}
        </h2>
        <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ scaleY: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 h-4 bg-primary"
                />
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
