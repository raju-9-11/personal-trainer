
import { useState } from 'react';
import { TherapyMode, BaseContext, GeneratedTherapist } from '../../lib/ai/types';
import { IntakeChat } from './IntakeChat';
import { TherapistSelection } from './TherapistSelection';
import { SessionView } from './SessionView';
import { BootLoader } from '../ui/boot-loader';
import { TherapistLayout } from './ui/TherapistLayout';

interface TherapyContainerProps {
  initialMode?: TherapyMode;
  initialContext?: BaseContext;
  initialTherapist?: GeneratedTherapist;
  onSaveProfile: (context: BaseContext, therapist: GeneratedTherapist, password?: string) => Promise<void>;
}

export function TherapyContainer({ 
  initialMode = 'intake', 
  initialContext, 
  initialTherapist,
  onSaveProfile 
}: TherapyContainerProps) {
  const [mode, setMode] = useState<TherapyMode>(initialMode);
  const [context, setContext] = useState<BaseContext>(initialContext || {});
  const [selectedTherapist, setSelectedTherapist] = useState<GeneratedTherapist | undefined>(initialTherapist);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleIntakeComplete = async (transcript: any[]) => {
    setIsAnalyzing(true);
    // TODO: Send transcript to LLM for analysis and structured extraction
    // For now, mock extraction
    const extractedContext: BaseContext = {
        intakeTranscript: transcript,
        childhood: "Extracted from chat...",
        trauma: "Extracted from chat...",
        goals: "To be happy..."
    };
    
    setContext(extractedContext);
    setMode('selection');
    setIsAnalyzing(false);
  };

  const handleTherapistSelected = (therapist: GeneratedTherapist) => {
    setSelectedTherapist(therapist);
    // Proceed to secure/save step, or directly to session if already secured
    // For new flow, we might want a "Secure & Start" step here.
    // For now, let's assume the parent handles saving via callback
    setMode('session');
  };

  if (isAnalyzing) {
    return (
        <TherapistLayout>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <BootLoader />
                <p className="text-slate-500 animate-pulse">Analyzing your session to find the perfect match...</p>
            </div>
        </TherapistLayout>
    );
  }

  switch (mode) {
    case 'intake':
      return <IntakeChat onComplete={handleIntakeComplete} />;
    case 'selection':
      return (
        <TherapistSelection 
            context={context} 
            onSelect={handleTherapistSelected}
            onSave={(t, p) => onSaveProfile(context, t, p)}
        />
      );
    case 'session':
        // The SessionView now needs to support the GeneratedTherapist object
        // We'll need to update SessionView or wrap it to adapt
        if (!selectedTherapist) return <div>Error: No therapist selected</div>;
        
        // Mocking the unlockedProfile structure expected by current SessionView
        // We will refactor SessionView next to take GeneratedTherapist directly or keep wrapper
        return (
            <SessionView 
                unlockedProfile={{
                    context: { context, personaId: selectedTherapist.id }, // ID might need adjustment
                    password: '' // handled internally or passed down if needed
                }} 
                // We'll pass the full therapist object as a new prop to SessionView
                currentTherapist={selectedTherapist}
            />
        );
    default:
      return <div>Unknown mode</div>;
  }
}
