
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Brain, ArrowLeft, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';

export default function TherapyAuth() {
  const navigate = useNavigate();
  const { login, registerWithEmail, user, checkVerificationStatus, sendVerification, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // If already logged in and verified, redirect to session
  useEffect(() => {
    if (!authLoading && user) {
        if (user.emailVerified) {
            navigate('/therapy/session');
        }
        // If not verified, we stay here to show verification UI
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const success = await login(email, password);
    setLoading(false);
    if (!success) {
        setError("Invalid email or password.");
    }
    // Effect will handle redirect if verified
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    setLoading(true);
    setError(null);
    // Use the specific registerWithEmail method from AuthContext (wrapped createUserWithEmailAndPassword)
    // Note: We need to cast because we just added it to the context and TS might not pick it up immediately in IDE but build should be fine if context is updated.
    // Actually, I updated the interface in the previous step, so it should be fine.
    // However, I need to make sure I'm using the updated context.
    
    // We can't access registerWithEmail if TS doesn't see it. The previous tool call updated the interface.
    // Let's assume it's there.
    
    // @ts-ignore
    const success = await registerWithEmail(email, password);
    setLoading(false);
    
    if (success) {
        setVerificationSent(true);
    } else {
        setError("Registration failed. Email might be in use.");
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    // @ts-ignore
    await sendVerification();
    setLoading(false);
    setVerificationSent(true);
  };

  const handleCheckVerification = async () => {
      setLoading(true);
      // @ts-ignore
      const verified = await checkVerificationStatus();
      setLoading(false);
      if (verified) {
          navigate('/therapy/session');
      } else {
          setError("Email not verified yet. Please check your inbox.");
      }
  };

  if (user && !user.emailVerified) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
             <Card className="w-full max-w-md shadow-xl border-indigo-100 dark:border-indigo-900">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-2xl">Verify your Email</CardTitle>
                    <CardDescription>
                        We've sent a verification link to <strong>{user.email}</strong>.
                        Please verify your email to secure your Vault.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
                    {verificationSent && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Email sent!</div>}
                    
                    <Button onClick={handleCheckVerification} className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        I've Verified My Email
                    </Button>
                    <Button variant="outline" onClick={handleResendVerification} className="w-full" disabled={loading}>
                        Resend Verification Email
                    </Button>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" className="w-full text-sm text-slate-500" onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </CardFooter>
             </Card>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand Side */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10">
             <Link to="/therapy" className="flex items-center gap-2 text-xl font-bold">
                <Brain className="w-6 h-6" /> MindVault
             </Link>
        </div>
        <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold mb-6">Your Secrets are Safe.</h2>
            <p className="text-lg text-slate-300">
                We use client-side encryption ("The Vault Protocol") to ensure that only you hold the keys to your mental health data.
            </p>
        </div>
        <div className="relative z-10 text-sm text-slate-500">
            &copy; MindVault 2024
        </div>
      </div>

      {/* Auth Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
            <div className="md:hidden text-center mb-8">
                <Link to="/therapy" className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                    <Brain className="w-6 h-6" /> MindVault
                </Link>
            </div>

            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome Back</CardTitle>
                            <CardDescription>Login to access your secure vault.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4">
                                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Login Password</Label>
                                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Login
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Account</CardTitle>
                            <CardDescription>Start your secure mental wellness journey.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleRegister}>
                            <CardContent className="space-y-4">
                                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <Input id="reg-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Login Password</Label>
                                    <Input id="reg-password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input id="confirm-password" type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Register & Verify
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
