'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Mail, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [mockUser, setMockUser] = useState('trainer1'); // Default for mock mode
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { sendLoginLink, loginAsTrainer } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendLoginLink(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send login link');

      // Fallback/Dev hint if Firebase is not configured properly or intentionally failing in dev
      if (process.env.NEXT_PUBLIC_USE_FIREBASE !== 'true') {
         setError('Firebase is not enabled. Use Mock Login below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    loginAsTrainer(mockUser);
    router.push('/admin/dashboard');
  };

  if (sent) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md text-center">
             <CardHeader>
                <CardTitle>Check your inbox!</CardTitle>
                <CardDescription>We sent a login link to {email}</CardDescription>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">
                   Click the link in the email to sign in. You can close this tab.
                </p>
             </CardContent>
          </Card>
        </div>
     );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Shield className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Trainer Portal</CardTitle>
          <CardDescription>Enter your email to sign in password-free</CardDescription>
        </CardHeader>

        <form onSubmit={handleEmailLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input
                    type="email"
                    placeholder="name@titanfitness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                 />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Login Link"}
            </Button>
          </CardContent>
        </form>

        {/* Mock Login Section for Development/Demo Ease */}
        <div className="border-t border-border p-6 bg-muted/30">
           <p className="text-xs text-center text-muted-foreground mb-4 uppercase tracking-wider font-bold">Or (Mock Mode)</p>
           <form onSubmit={handleMockLogin} className="flex gap-2">
              <div className="relative flex-grow">
                 <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   value={mockUser}
                   onChange={(e) => setMockUser(e.target.value)}
                   placeholder="trainer1"
                   className="pl-9 h-10"
                 />
              </div>
              <Button variant="secondary" type="submit">Login</Button>
           </form>
           <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Try 'trainer1' or 'testtrainer'
           </p>
        </div>
      </Card>
    </div>
  );
}
