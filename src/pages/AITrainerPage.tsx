import React from 'react';
import { useAITrainer } from '../components/ai-trainer/AITrainerContext';
import { AITrainerAuth } from '../components/ai-trainer/AITrainerAuth';
import { AITrainerDashboard } from '../components/ai-trainer/AITrainerDashboard';
import { AITrainerChat } from '../components/ai-trainer/ui/AITrainerChat';
import { AITrainerOnboarding } from '../components/ai-trainer/AITrainerOnboarding';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, ArrowLeft } from 'lucide-react';

const AITrainerPageContent = () => {
  const { isLocked, hasProfile, isOnboarding } = useAITrainer();

  if (isLocked || !hasProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center">
        <AITrainerAuth />
      </div>
    );
  }

  if (isOnboarding) {
    return <AITrainerOnboarding />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors">
                 <ArrowLeft className="w-5 h-5" />
             </Link>
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-primary" />
                 </div>
                 <h1 className="text-xl font-bold tracking-tight">AI Trainer Dashboard</h1>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Area */}
          <div className="lg:col-span-2 space-y-8">
            <AITrainerDashboard />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-1 h-full sticky top-24">
            <AITrainerChat />
          </div>
        </div>
      </main>
    </div>
  );
};

export default function AITrainerPage() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <AITrainerPageContent />;
}
