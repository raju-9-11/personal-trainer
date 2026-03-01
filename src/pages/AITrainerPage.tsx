import React from 'react';
import { useAITrainer, AITrainerProvider } from '../components/ai-trainer/AITrainerContext';
import { AITrainerAuth } from '../components/ai-trainer/AITrainerAuth';
import { AITrainerDashboard } from '../components/ai-trainer/AITrainerDashboard';
import { AITrainerChat } from '../components/ai-trainer/ui/AITrainerChat';
import { AITrainerOnboarding } from '../components/ai-trainer/AITrainerOnboarding';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppNavbar } from '../components/layout/app-navbar';
import { AIProvider } from '../lib/ai/ai-context';
import { useLocation } from 'react-router-dom';

const AITrainerPageContent = () => {
  const { isLocked, hasProfile, isLoading, onboardingStatus } = useAITrainer();
  const location = useLocation();
  const forceOnboarding = new URLSearchParams(location.search).get('onboarding') === '1';

  // Only show full-screen loader during initial boot or auth transition.
  // We check (!hasProfile || isLocked) to ensure we have the minimum data to render the UI.
  // Once we have a profile and are unlocked, isLoading just means "AI is thinking" and 
  // we should let the child components (Chat/Onboarding) handle their own loading UI.
  if (isLoading && (!hasProfile || isLocked)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Neural Data...</p>
        </div>
      </div>
    );
  }

  if (isLocked || !hasProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNavbar />
        <div className="flex flex-col justify-center px-4 py-12">
          <AITrainerAuth />
        </div>
      </div>
    );
  }

  const showOnboarding = ['collecting', 'completing', 'failed'].includes(onboardingStatus) || forceOnboarding;

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNavbar />
        <AITrainerOnboarding />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
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
  return (
    <ProtectedRoute redirectTo="/admin/login">
      <AITrainerPageContent />
    </ProtectedRoute>
  );
}
