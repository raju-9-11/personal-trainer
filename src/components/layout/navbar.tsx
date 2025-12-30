'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Dumbbell, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useBrandIdentity, useTrainerSlug } from '@/components/TrainerContext';
import { DEFAULT_BRAND_NAME } from '@/lib/constants';
import { useTheme } from '@/components/ThemeContext';

function BrandIcon({ logoUrl, brandName, loading }: { logoUrl?: string; brandName: string; loading: boolean }) {
  if (loading) return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  
  if (logoUrl) {
    return (
      <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-md transition-all">
        <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" />
      </div>
    );
  }

  const initial = brandName.trim().charAt(0).toUpperCase() || 'P';
  
  // Generate a stable "random" progress value based on the name length (between 65% and 90%)
  const progress = 65 + (brandName.length * 3) % 25;
  const circumference = 2 * Math.PI * 18; // r=18
  const dashArray = circumference;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-10 w-10 flex items-center justify-center group cursor-pointer">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 44 44">
        {/* Track Ring */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted-foreground/20"
        />
        {/* Progress Ring */}
        <motion.circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary drop-shadow-sm"
          initial={{ strokeDasharray: dashArray, strokeDashoffset: dashArray }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      
      {/* Initial */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black italic tracking-tighter text-foreground group-hover:scale-110 transition-transform duration-300">
          {initial}
        </span>
      </div>
      
      {/* Pulse Effect on Hover */}
      <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500" />
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const slug = useTrainerSlug();
  const { theme, toggleTheme } = useTheme();
  const { identity, loading } = useBrandIdentity();
  const resolvedName = identity?.brandName;
  const brandName = resolvedName || (loading ? '' : DEFAULT_BRAND_NAME);
  const isLoadingIdentity = loading && !resolvedName;
  const [brandLabel, highlightedLabel] = React.useMemo(() => {
    const trimmed = brandName.trim();
    if (!trimmed) {
      return ['', ''];
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return [parts[0], ''];
    }
    return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
  }, [brandName]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const profileHref = slug ? `/${slug}` : '/';

  // Links must be relative to the slug page
  const links = [
    { href: `#about`, label: 'About' },
    { href: `#certifications`, label: 'Certifications' },
    { href: `#transformations`, label: 'Transformations' },
    { href: `#classes`, label: 'Classes' },
    { href: `#contact`, label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={profileHref} className="flex items-center space-x-3 font-bold text-xl uppercase tracking-tighter hover:opacity-90 transition-all group">
          <BrandIcon logoUrl={identity?.logoUrl} brandName={brandName} loading={loading} />
          {isLoadingIdentity ? (
            <span className="text-sm font-medium text-muted-foreground animate-pulse opacity-0">...</span>
          ) : (
            <span className="transition-colors group-hover:text-primary">
              {highlightedLabel ? (
                <>
                  {brandLabel}{' '}
                  <span className="text-primary">{highlightedLabel}</span>
                </>
              ) : (
                brandLabel || DEFAULT_BRAND_NAME
              )}
            </span>
          )}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </Button>
          <Button variant="default" size="sm" asChild>
            <a href="#contact">Book Now</a>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-b border-border/40 bg-background"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button className="w-full" asChild>
              <a href="#contact" onClick={() => setIsOpen(false)}>Book Your Session</a>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
