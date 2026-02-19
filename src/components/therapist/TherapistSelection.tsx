
import { useState, useEffect } from 'react';
import { TherapistLayout } from './ui/TherapistLayout';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BaseContext, GeneratedTherapist, Gender } from '../../lib/ai/types';
import { generateTherapistOptions } from '../../lib/ai/personas';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, RefreshCw, User, Loader2 } from 'lucide-react';
import { TherapistAvatar } from './ui/TherapistAvatar';

interface TherapistSelectionProps {
  context: BaseContext;
  onSelect: (therapist: GeneratedTherapist) => void;
  onSave: (therapist: GeneratedTherapist, password: string) => Promise<void>;
}

export function TherapistSelection({ context, onSelect, onSave }: TherapistSelectionProps) {
  const [gender, setGender] = useState<Gender>('female');
  const [options, setOptions] = useState<GeneratedTherapist[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<'browsing' | 'securing'>('browsing');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Regenerate options when gender changes
    const newOptions = generateTherapistOptions(context, gender);
    setOptions(newOptions);
    // Reset selection if it's no longer valid (though IDs change every time, so yes)
    setSelectedId(null);
  }, [gender, context]);

  const handleConfirmSelection = () => {
    if (selectedId) {
      setStep('securing');
    }
  };

  const handleSave = async () => {
    if (password !== confirmPassword) return;
    if (!password) return;
    
    const therapist = options.find(o => o.id === selectedId);
    if (!therapist) return;

    setIsSaving(true);
    try {
        await onSave(therapist, password);
        onSelect(therapist);
    } catch (e) {
        console.error(e);
        setIsSaving(false);
    }
  };

  const selectedTherapist = options.find(o => o.id === selectedId);

  if (step === 'securing' && selectedTherapist) {
      return (
        <TherapistLayout title="Secure Your Session" showBack={true} onBack={() => setStep('browsing')}>
            <div className="max-w-md mx-auto space-y-8 pt-10">
                <div className="text-center">
                    <div className="mx-auto w-24 h-24 mb-4 relative">
                        <TherapistAvatar state="idle" className="w-full h-full" />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                            <Check className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold">{selectedTherapist.name}</h3>
                    <p className="text-slate-500">{selectedTherapist.role}</p>
                </div>

                <div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-medium">Create Vault Password</h4>
                    </div>
                    <p className="text-sm text-slate-500">
                        Your data is encrypted locally. We cannot recover this password if lost.
                    </p>
                    <Input 
                        type="password" 
                        placeholder="New Password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white dark:bg-black/20"
                    />
                    <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="bg-white dark:bg-black/20"
                    />
                    <Button 
                        className="w-full" 
                        disabled={!password || password !== confirmPassword || isSaving}
                        onClick={handleSave}
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Encrypt & Begin Journey'}
                    </Button>
                </div>
            </div>
        </TherapistLayout>
      );
  }

  return (
    <TherapistLayout title="Select Your Therapist" showBack={false}>
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6 px-4">
            <div>
                <h2 className="text-lg font-medium">Recommended Matches</h2>
                <p className="text-sm text-slate-500">Based on your intake profile</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                {(['female', 'male', 'non-binary'] as Gender[]).map(g => (
                    <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            gender === g 
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-20 overflow-y-auto">
            {options.map((option) => (
                <motion.div
                    key={option.id}
                    layoutId={option.id}
                    onClick={() => setSelectedId(option.id)}
                    className={`cursor-pointer group relative p-6 rounded-2xl border transition-all ${
                        selectedId === option.id 
                        ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                            {/* Placeholder for specific avatar images based on gender/archetype */}
                            <User className={`w-8 h-8 ${selectedId === option.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{option.name}</h3>
                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{option.role}</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {option.description}
                        </p>
                    </div>
                    
                    {selectedId === option.id && (
                        <div className="absolute top-4 right-4 text-indigo-600">
                            <Check className="w-5 h-5" />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>

        {/* Footer Action */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-black via-white/80 dark:via-black/80 to-transparent flex justify-center">
            <Button 
                size="lg" 
                className="w-full max-w-sm shadow-xl"
                disabled={!selectedId}
                onClick={handleConfirmSelection}
            >
                Confirm Selection
            </Button>
        </div>
      </div>
    </TherapistLayout>
  );
}
