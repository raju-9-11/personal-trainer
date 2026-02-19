
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { getFirebase } from '../lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { PasswordGate } from '../components/therapist/PasswordGate';
import { TherapistLayout } from '../components/therapist/ui/TherapistLayout';
import { TherapistProfile, BaseContext, GeneratedTherapist } from '../lib/ai/types';
import { BootLoader } from '../components/ui/boot-loader';
import { TherapyContainer } from '../components/therapist/TherapyContainer';
import { encryptData } from '../lib/encryption';

type UnlockedProfile = {
  data: {
    context: BaseContext;
    personaId?: string; // Legacy
    therapist?: GeneratedTherapist; // New
  };
  password: string;
};

export default function TherapistPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [unlockedProfile, setUnlockedProfile] = useState<UnlockedProfile | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const initAuth = async () => {
        const { auth } = getFirebase();
        if (!user && auth) {
            try {
                // Auto-login as anonymous guest for clients
                await signInAnonymously(auth);
                // The auth state listener in AuthContext will pick this up 
                // and trigger a re-render with the new user.
                return; 
            } catch (e) {
                console.error("Anonymous login failed", e);
                // Fallback or let it fail gracefully? 
                // For now, if anon login fails, we might be offline or no config.
                // We'll proceed with null user and likely fail on Firestore ops unless we mock.
            }
        }
        
        if (!user) {
             // If still no user (e.g. no auth provider), we can't save/load profile.
             // But we shouldn't redirect to admin login. 
             // Maybe show a "Guest Mode" warning or just let it be.
             setLoading(false);
             return;
        }

        // Fetch Profile
        const fetchProfile = async () => {
            try {
                const { db } = getFirebase();
                if (!db) {
                     setLoading(false);
                     return;
                }

                const docRef = doc(db, 'therapist_profiles', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data() as TherapistProfile);
                } else {
                    setProfile(null); // Triggers onboarding
                }
            } catch (error) {
                console.error("Error fetching therapist profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    };

    initAuth();
  }, [user, authLoading, navigate]);

  const handleSaveProfile = async (context: BaseContext, therapist: GeneratedTherapist, password?: string) => {
      if (!user || !password) return;

      try {
          // Prepare data to encrypt
          const secretData = JSON.stringify({
              context,
              therapist
          });

          const encryptedContext = await encryptData(secretData, password);

          const newProfile: TherapistProfile = {
              encryptedContext,
              therapistId: therapist.id,
              lastSessionDate: new Timestamp(Date.now() / 1000, 0).toDate().toISOString()
          };

          const { db } = getFirebase();
          if (db) {
              await setDoc(doc(db, 'therapist_profiles', user.uid), newProfile);
          }
          
          // Update local state to "logged in"
          setUnlockedProfile({
              data: { context, therapist },
              password
          });
          setProfile(newProfile);

      } catch (e) {
          console.error("Failed to save profile", e);
          alert("Failed to save profile. Please try again.");
      }
  };

  if (authLoading || loading) {
    return <TherapistLayout><div className="flex items-center justify-center h-full"><BootLoader /></div></TherapistLayout>;
  }

  // 1. No Profile -> Intake Flow (TherapyContainer handles intake -> selection -> save)
  if (!profile) {
    return (
        <TherapyContainer 
            initialMode='intake'
            onSaveProfile={handleSaveProfile}
        />
    );
  }

  // 2. Profile exists but locked -> Password Gate
  if (!unlockedProfile) {
    return (
      <PasswordGate
        encryptedData={profile.encryptedContext}
        onUnlock={(decryptedData, password) => {
           const parsed = JSON.parse(decryptedData);
           setUnlockedProfile({ data: parsed, password });
        }}
      />
    );
  }

  // 3. Unlocked -> Session (TherapyContainer handles session view)
  return (
      <TherapyContainer 
          initialMode='session'
          initialContext={unlockedProfile.data.context}
          initialTherapist={unlockedProfile.data.therapist}
          onSaveProfile={handleSaveProfile} // Passed but likely not used in session mode yet
      />
  );
}
