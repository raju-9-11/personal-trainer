import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';

interface TherapistLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export function TherapistLayout({ children, showBack = true, onBack, title }: TherapistLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[100px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-rose-100/20 dark:bg-rose-900/10 rounded-full blur-[120px]"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-white/30 dark:bg-black/10 border-b border-white/20 dark:border-white/5">
        <div className="flex items-center gap-4">
          {showBack && (
            onBack ? (
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Go Back"
                >
                    <ChevronLeft className="w-5 h-5 opacity-70" />
                </button>
            ) : (
                <Link
                to="/"
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Back to Home"
                >
                <ChevronLeft className="w-5 h-5 opacity-70" />
                </Link>
            )
          )}
          {title && (
            <h1 className="text-lg font-medium tracking-tight opacity-90">{title}</h1>
          )}
        </div>

        {/* Profile Link */}
        {user ? (
            <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <span className="text-sm font-bold">{user.displayName?.charAt(0) || user.email?.charAt(0) || <User className="w-5 h-5" />}</span>
                )}
            </Link>
        ) : (
            <Link to="/therapy/auth">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                    <User className="w-4 h-4 text-slate-500" />
                </div>
            </Link>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-4 py-8 h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
