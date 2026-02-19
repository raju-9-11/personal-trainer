
import { useState } from 'react';
import { TherapyMode, BaseContext, GeneratedTherapist, TherapistProfile } from '../../lib/ai/types';
import { IntakeChat } from './IntakeChat';
import { TherapistSelection } from './TherapistSelection';
import { SessionView } from './SessionView';
import { BootLoader } from '../ui/boot-loader';
import { TherapistLayout } from './ui/TherapistLayout';
import { VaultSetup } from './VaultSetup';
import { VaultUnlock } from './VaultUnlock';
import { encryptData, decryptData } from '../../lib/encryption';
import { doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getFirebase } from '../../lib/firebase';
import { useAuth } from '../../lib/auth-context';

import { AIProvider } from '../../lib/ai/ai-context';

type ExtendedTherapyMode = TherapyMode | 'vault-setup' | 'locked';

interface TherapyContainerProps {
  initialMode?: ExtendedTherapyMode;
  initialContext?: BaseContext;
  initialTherapist?: GeneratedTherapist;
  encryptedProfile?: TherapistProfile; // If loading existing
}

export function TherapyContainer({ 
  initialMode = 'intake', 
  initialContext, 
  initialTherapist,
  encryptedProfile 
}: TherapyContainerProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<ExtendedTherapyMode>(initialMode);
  const [context, setContext] = useState<BaseContext>(initialContext || {});
  const [selectedTherapist, setSelectedTherapist] = useState<GeneratedTherapist | undefined>(initialTherapist);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vaultPassword, setVaultPassword] = useState<string | null>(null);

  const handleIntakeComplete = async (transcript: any[]) => {
    setIsAnalyzing(true);
    // Simulate analysis delay
    setTimeout(() => {
        const extractedContext: BaseContext = {
            intakeTranscript: transcript,
            childhood: "Extracted from intake...", 
            trauma: "Extracted from intake...",
            goals: "Extracted from intake...",
            struggles: ["anxiety", "stress"], // Mock
            sessionCount: 0
        };
        
        setContext(extractedContext);
        setMode('selection');
        setIsAnalyzing(false);
    }, 1500);
  };

  const handleTherapistSelected = (therapist: GeneratedTherapist) => {
    setSelectedTherapist(therapist);
    setMode('vault-setup');
  };

  const handleVaultSetup = async (password: string) => {
      if (!user || !selectedTherapist) return;
      
      setVaultPassword(password);
      
      // Encrypt and Save
      try {
          const secretData = JSON.stringify({
              context,
              therapist: selectedTherapist
          });

          const encryptedData = await encryptData(secretData, password);
          
          // We need salt/iv from encryptData, but the current helper returns a JSON string containing them?
          // Let's check the helper. Yes, it returns JSON string of {ciphertext, iv, salt}
          // But our Firestore schema expects them separate or as one blob?
          // The helper `encryptData` returns a JSON string.
          // Let's parse it to store structured if we want, or just store the string.
          // The types say `encryptedData: string`. So we can just store the string.
          
          // Wait, the new `EncryptedProfile` interface has `iv`, `salt` separate.
          // Let's parse the helper output.
          const parsed = JSON.parse(encryptedData);

          const newProfile = {
              encryptedData: parsed.ciphertext,
              iv: parsed.iv,
              salt: parsed.salt,
              metadata: {
                  hasVault: true,
                  lastActive: new Date().toISOString(),
                  therapistName: selectedTherapist.name,
                  sessionCount: 0
              }
          };

          const { db } = getFirebase();
          if (db) {
              await setDoc(doc(db, 'therapist_profiles', user.uid), newProfile);
          }
          
          setMode('session');

      } catch (e) {
          console.error("Failed to setup vault", e);
          alert("Failed to create vault. Please try again.");
      }
  };

  const handleUnlock = async (password: string): Promise<boolean> => {
      if (!encryptedProfile) return false;

      try {
          // Reconstruct the JSON object expected by decryptData
          const jsonForDecrypt = JSON.stringify({
              ciphertext: encryptedProfile.encryptedData,
              iv: encryptedProfile.iv,
              salt: encryptedProfile.salt
          });

          const decryptedJson = await decryptData(jsonForDecrypt, password);
          const data = JSON.parse(decryptedJson);
          
          setContext(data.context);
          setSelectedTherapist(data.therapist);
          setVaultPassword(password);
          setMode('session');
          return true;
      } catch (e) {
          console.error("Decryption failed", e);
          return false;
      }
  };

  const handleVaultReset = async () => {
      if (!user) return;
      try {
          const { db } = getFirebase();
          if (db) {
              await deleteDoc(doc(db, 'therapist_profiles', user.uid));
          }
          setContext({});
          setSelectedTherapist(undefined);
          setVaultPassword(null);
          setMode('intake');
      } catch (e) {
          console.error("Vault reset failed", e);
          throw e;
      }
  };
  
  const handleSaveSession = async (updatedContext: BaseContext) => {
      // Called by SessionView when session ends or autosaves
      if (!user || !vaultPassword || !selectedTherapist) return;
      
      try {
          const secretData = JSON.stringify({
              context: updatedContext,
              therapist: selectedTherapist
          });
          
          const encryptedData = await encryptData(secretData, vaultPassword);
          const parsed = JSON.parse(encryptedData);
          
          const { db } = getFirebase();
          if (db) {
              // Merge update
               await setDoc(doc(db, 'therapist_profiles', user.uid), {
                   encryptedData: parsed.ciphertext,
                   iv: parsed.iv,
                   salt: parsed.salt,
                   metadata: {
                       lastActive: new Date().toISOString(),
                       sessionCount: (updatedContext.sessionCount || 0)
                   }
               }, { merge: true });
          }
      } catch (e) {
          console.error("Auto-save failed", e);
      }
  };

  if (isAnalyzing) {
    return (
        <AIProvider>
            <TherapistLayout>
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <BootLoader />
                    <p className="text-slate-500 animate-pulse">Analyzing your session to find the perfect match...</p>
                </div>
            </TherapistLayout>
        </AIProvider>
    );
  }

  switch (mode) {
    case 'intake':
      return <AIProvider><IntakeChat onComplete={handleIntakeComplete} /></AIProvider>;
    case 'selection':
      return (
        <AIProvider>
            <TherapistSelection 
                context={context} 
                onSelect={handleTherapistSelected}
            />
        </AIProvider>
      );
    case 'vault-setup':
        return <AIProvider><VaultSetup onSetupComplete={handleVaultSetup} /></AIProvider>;
    case 'locked':
        return <AIProvider><VaultUnlock onUnlock={handleUnlock} onReset={handleVaultReset} /></AIProvider>;
    case 'session':
        if (!selectedTherapist) return <div>Error: No therapist selected</div>;
        return (
            <AIProvider>
                <SessionView 
                    initialContext={context}
                    therapist={selectedTherapist}
                    onSave={handleSaveSession}
                />
            </AIProvider>
        );
    default:
      return <div>Unknown mode</div>;
  }
}
