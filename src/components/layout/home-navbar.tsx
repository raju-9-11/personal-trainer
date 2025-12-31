import * as React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeContext';
import { DEFAULT_BRAND_NAME } from '@/lib/constants';
import { useBrandIdentity } from '@/components/TrainerContext';

function BrandIcon({ logoUrl, brandName, loading, logoScale = 'fit', isScrolled }: { logoUrl?: string; brandName: string; loading: boolean; logoScale?: 'fit' | 'fill'; isScrolled: boolean }) {
  if (loading) return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  
  if (logoUrl) {
    const objectClass = logoScale === 'fill' ? 'object-cover' : 'object-contain';
    return (
      <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-md transition-all">
        <img src={logoUrl} alt={brandName} className={`h-full w-full ${objectClass} p-0.5`} />
      </div>
    );
  }

  const initial = brandName.trim().charAt(0).toUpperCase() || 'P';
  const progress = 65 + (brandName.length * 3) % 25;
  const circumference = 2 * Math.PI * 18;
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
          className={isScrolled ? "text-muted-foreground/20" : "text-white/20"}
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
          className="text-primary"
          initial={{ strokeDasharray: dashArray, strokeDashoffset: dashArray }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      
      {/* Initial */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-black italic -rotate-6 select-none transition-transform duration-300 ${isScrolled ? "text-foreground" : "text-white"}`}>
          {initial}
        </span>
      </div>
    </div>
  );
}

export function HomeNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { identity, loading } = useBrandIdentity();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const brandName = identity?.brandName || (loading ? '' : DEFAULT_BRAND_NAME);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? "border-b border-border/40 bg-background/95 backdrop-blur-md py-2 shadow-sm" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 font-bold text-xl uppercase tracking-tighter hover:opacity-90 transition-all group">
            <BrandIcon 
                logoUrl={identity?.logoUrl} 
                brandName={brandName} 
                loading={loading} 
                logoScale={identity?.logoScale} 
                isScrolled={isScrolled}
            />
            <span className={`transition-colors duration-300 ${
                isScrolled 
                    ? "text-foreground group-hover:text-primary" 
                    : "text-white drop-shadow-md"
            }`}>
              {brandName}
            </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            className={`transition-colors duration-300 ${
                !isScrolled ? "text-white hover:bg-white/10" : ""
            }`}
          >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}