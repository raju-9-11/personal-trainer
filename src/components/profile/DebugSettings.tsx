
import { useState } from 'react';
import { useAI } from '../../lib/ai/ai-context';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertTriangle, Save } from 'lucide-react';

// DEBUG ONLY - TO BE REMOVED
export function DebugSettings() {
  const { activeProvider, setProvider, availableProviders } = useAI();
  const [localKeys, setLocalKeys] = useState({
      openrouter: localStorage.getItem('VITE_OPENROUTER_API_KEY') || '',
      grok: localStorage.getItem('VITE_GROK_API_KEY') || '',
      google: localStorage.getItem('VITE_GOOGLE_API_KEY') || ''
  });

  const handleSaveKeys = () => {
      if (localKeys.openrouter) localStorage.setItem('VITE_OPENROUTER_API_KEY', localKeys.openrouter);
      else localStorage.removeItem('VITE_OPENROUTER_API_KEY');

      if (localKeys.grok) localStorage.setItem('VITE_GROK_API_KEY', localKeys.grok);
      else localStorage.removeItem('VITE_GROK_API_KEY');

      if (localKeys.google) localStorage.setItem('VITE_GOOGLE_API_KEY', localKeys.google);
      else localStorage.removeItem('VITE_GOOGLE_API_KEY');

      window.location.reload(); // Reload to pick up new env vars (simulated)
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
        <CardHeader>
            <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle>Developer Debug Mode</CardTitle>
            </div>
            <CardDescription>
                These settings are for development purposes only. 
                API Keys set here are stored in LocalStorage.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Active AI Provider</Label>
                <Select value={activeProvider} onValueChange={(v: any) => setProvider(v)}>
                    <SelectTrigger className="bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                        {['openrouter', 'grok', 'google', 'mock'].map((p) => (
                            <SelectItem key={p} value={p}>
                                {p.charAt(0).toUpperCase() + p.slice(1)} 
                                {availableProviders.includes(p as any) ? '' : ' (Unavailable)'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>API Key Overrides</CardTitle>
              <CardDescription>Enter keys to test different providers locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label>OpenRouter Key</Label>
                  <Input 
                    type="password" 
                    value={localKeys.openrouter} 
                    onChange={e => setLocalKeys({...localKeys, openrouter: e.target.value})} 
                    placeholder="sk-or-..."
                  />
              </div>
              <div className="space-y-2">
                  <Label>Grok (xAI) Key</Label>
                  <Input 
                    type="password" 
                    value={localKeys.grok} 
                    onChange={e => setLocalKeys({...localKeys, grok: e.target.value})} 
                    placeholder="xai-..."
                  />
              </div>
              <div className="space-y-2">
                  <Label>Google Gemini Key</Label>
                  <Input 
                    type="password" 
                    value={localKeys.google} 
                    onChange={e => setLocalKeys({...localKeys, google: e.target.value})} 
                    placeholder="AIza..."
                  />
              </div>
              <Button onClick={handleSaveKeys} className="w-full">
                  <Save className="w-4 h-4 mr-2" /> Save & Reload
              </Button>
          </CardContent>
      </Card>
    </div>
  );
}
