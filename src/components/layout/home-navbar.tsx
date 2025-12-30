import * as React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeContext';
import { DEFAULT_BRAND_NAME } from '@/lib/constants';

export function HomeNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 font-bold text-xl uppercase tracking-tighter hover:opacity-90 transition-all group">
            <span className="text-primary italic font-black">T</span>
            <span className="transition-colors group-hover:text-primary">
              {DEFAULT_BRAND_NAME}
            </span>
        </Link>

        {/* Desktop Menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </Button>
          <Button variant="default" size="sm" asChild>
            <a href="#trainers">Find Coach</a>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
