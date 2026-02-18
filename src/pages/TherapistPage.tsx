
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { getFirebase } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { OnboardingFlow } from '../components/therapist/OnboardingFlow';
import { SessionView } from '../components/therapist/SessionView';
import { PasswordGate } from '../components/therapist/PasswordGate';
import { TherapistLayout } from '../components/therapist/ui/TherapistLayout';
import { TherapistProfile, BaseContext } from '../lib/ai/types';
import { BootLoader } from '../components/ui/boot-loader';

type UnlockedProfile = {
  context: {
    context: BaseContext;
    personaId: string;
  };
  password: string;
};

export default function TherapistPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [unlockedProfile, setUnlockedProfile] = useState<UnlockedProfile | null>(null); // Decrypted context

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/admin/login'); // Or a dedicated login for therapist? user said "logged in", reusing admin login is easiest for now.
      return;
    }

    const fetchProfile = async () => {
      try {
        const { db } = getFirebase();
        if (!db) return;

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
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return <TherapistLayout><div className="flex items-center justify-center h-full"><BootLoader /></div></TherapistLayout>;
  }

  // 1. No Profile -> Onboarding
  if (!profile) {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  // 2. Profile exists but locked -> Password Gate
  if (!unlockedProfile) {
    return (
      <PasswordGate
        encryptedData={profile.encryptedContext}
        onUnlock={(decryptedData, password) => {
           // We store the decrypted data and the password (in memory only) for session use
           setUnlockedProfile({ context: JSON.parse(decryptedData), password });
        }}
      />
    );
  }

  // 3. Unlocked -> Session
  return <SessionView unlockedProfile={unlockedProfile} />;
}
