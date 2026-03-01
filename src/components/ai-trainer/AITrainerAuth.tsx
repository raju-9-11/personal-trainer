import React, { useState } from 'react';
import { useAITrainer } from './AITrainerContext';
import { Button } from '../ui/button';
import { Lock, UserPlus } from 'lucide-react';
import { AITrainerProfile } from '../../lib/types';

export const AITrainerAuth = () => {
  const { unlock, setupProfile, hasProfile, isLoading, error } = useAITrainer();
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(!hasProfile);

  // Setup state
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [traits, setTraits] = useState('Motivating, Strict');
  const [goals, setGoals] = useState('Build Muscle, Lose Fat');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password) await unlock(password);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !name) return;

    const profile: AITrainerProfile = {
      name,
      gender,
      traits: traits.split(',').map(t => t.trim()),
      goals: goals.split(',').map(g => g.trim()),
    };
    await setupProfile(password, profile);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasProfile && !isRegistering) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-card rounded-xl border shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Unlock AI Trainer</h2>
        <p className="text-muted-foreground text-center mb-8">Enter your encryption password to decrypt your health data.</p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Encryption Password"
              className="w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full py-6 text-lg font-bold">Unlock Dashboard</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-card rounded-xl border shadow-xl">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-primary/10 rounded-full">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Setup Your AI Trainer</h2>
      <p className="text-muted-foreground text-center mb-8">Create your E2E encrypted personal trainer.</p>

      <form onSubmit={handleSetup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Trainer Name</label>
          <input
            type="text"
            className="w-full p-3 bg-background border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trainer Gender/Identity</label>
          <select
            className="w-full p-3 bg-background border rounded-lg"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trainer Traits (comma separated)</label>
          <input
            type="text"
            className="w-full p-3 bg-background border rounded-lg"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Your Goals (comma separated)</label>
          <input
            type="text"
            className="w-full p-3 bg-background border rounded-lg"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>
        <div className="pt-4 border-t">
          <label className="block text-sm font-medium mb-1">Encryption Password</label>
          <p className="text-xs text-muted-foreground mb-2">This password encrypts your health data locally. Do not lose it.</p>
          <input
            type="password"
            className="w-full p-3 bg-background border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit" className="w-full py-6 mt-4 text-lg font-bold">Create Trainer & Encrypt Data</Button>
      </form>
    </div>
  );
};
