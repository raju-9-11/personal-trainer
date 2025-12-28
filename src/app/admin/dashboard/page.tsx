'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-provider';
import { TrainerProfile, GymClass, Certification, Transformation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, logout, trainerSlug, user } = useAuth();
  const router = useRouter();
  const {
    getProfile, updateProfile,
    getClasses, addClass, removeClass,
    getCertifications, addCertification, removeCertification,
    getTransformations, addTransformation, removeTransformation
  } = useData();

  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [trans, setTrans] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);

  // Use the slug from auth context to fetch the initial "My Profile" data for the form.
  // Note: Write operations in DataProvider don't take slug; they rely on backend context/logic.
  // But Read operations need it if we are using the public 'getProfile(slug)' method.
  // Ideally, DataProvider should have 'getMyProfile()' or similar.
  // Since we updated DataProvider to take `slug` for reads, we use the `trainerSlug` from AuthContext.

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // If we don't have a trainerSlug (e.g. Firebase Auth just loaded but didn't resolve slug yet),
    // we might need to wait or rely on a different mechanism.
    // For Mock Mode, trainerSlug is set immediately.
    // For Firebase Mode, we might need to query it.

    // NOTE: In the current Mock implementation, `trainerSlug` is available.
    // In Firebase implementation, we might need to ensure it's fetched.
    // For now, let's assume `trainerSlug` is correct or default to 'trainer1' if using mock logic fallback.

    // If trainerSlug is null but we are authenticated via Firebase, we might be in a race condition
    // or the simple mapping logic in AuthContext isn't sufficient for the *UI* to know the slug.
    // However, the `FirebaseDataService.getProfile(slug)` needs the slug.

    // Temporary Fix for Firebase Mode in this UI:
    // If trainerSlug is missing, we can't fetch "My Data" via public methods easily without knowing who I am.
    // But `getTrainers()` lists everyone.
    // Let's rely on `trainerSlug` being present. If not, show loading.

    if (!trainerSlug && !user) return;

    // For Firebase, we might need to fetch "me".
    // Since we didn't implement `getMyProfile` explicitly in the interface (just `getProfile(slug)`),
    // we have a small gap.
    // WORKAROUND: In `FirebaseDataService`, `getProfile(slug)` is public read.
    // We need the slug.
    // Let's assume for this plan that `trainerSlug` is populated correctly by Auth or we default to 'trainer1' for safety in this demo.

    const targetSlug = trainerSlug || 'trainer1';

    const loadData = async () => {
      try {
        const [p, c, cer, t] = await Promise.all([
          getProfile(targetSlug),
          getClasses(targetSlug),
          getCertifications(targetSlug),
          getTransformations(targetSlug)
        ]);
        setProfile(p);
        setClasses(c);
        setCerts(cer);
        setTrans(t);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        // If profile doesn't exist, maybe prompt to create one?
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, router, getProfile, getClasses, getCertifications, getTransformations, trainerSlug, user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      await updateProfile(profile);
      alert('Profile updated!');
    }
  };

  const handleAddClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addClass({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      time: formData.get('time') as string,
      durationMinutes: parseInt(formData.get('duration') as string),
      maxSpots: parseInt(formData.get('spots') as string),
      enrolledSpots: 0
    });
    // Refresh
    setClasses(await getClasses(trainerSlug || 'trainer1'));
    (e.target as HTMLFormElement).reset();
  };

  const handleAddCert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addCertification({
      title: formData.get('title') as string,
      issuer: formData.get('issuer') as string,
      date: formData.get('date') as string,
    });
    setCerts(await getCertifications(trainerSlug || 'trainer1'));
    (e.target as HTMLFormElement).reset();
  };

  const handleAddTrans = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addTransformation({
      clientName: formData.get('clientName') as string,
      description: formData.get('description') as string,
      beforeImage: formData.get('beforeImage') as string,
      afterImage: formData.get('afterImage') as string,
    });
    setTrans(await getTransformations(trainerSlug || 'trainer1'));
    (e.target as HTMLFormElement).reset();
  };

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <header className="bg-background border-b border-border/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-bold">Admin Dashboard</h1>
           {trainerSlug && (
             <Button variant="ghost" size="sm" asChild>
               <Link href={`/${trainerSlug}`} target="_blank">
                 View My Page <ExternalLink className="ml-2 h-4 w-4" />
               </Link>
             </Button>
           )}
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground hidden md:inline-block">Logged in as {trainerSlug || user?.email}</span>
           <Button variant="outline" onClick={() => { logout(); router.push('/'); }}>Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!profile ? (
           <div className="text-center py-12">
             <h2 className="text-xl font-bold text-destructive mb-2">Profile Not Found</h2>
             <p className="text-muted-foreground">We couldn't load your profile data. Please contact support.</p>
           </div>
        ) : (
        <Tabs defaultValue="profile">
          <TabsList className="mb-8 flex flex-wrap h-auto gap-2">
            <TabsTrigger value="profile">Profile & Hero</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="certs">Certifications</TabsTrigger>
            <TabsTrigger value="trans">Transformations</TabsTrigger>
          </TabsList>

          {/* Profile Editor */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your main website content here.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hero Title</Label>
                      <Input value={profile.heroTitle} onChange={e => setProfile({...profile, heroTitle: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Subtitle</Label>
                      <Input value={profile.heroSubtitle} onChange={e => setProfile({...profile, heroSubtitle: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="h-32" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input value={profile.contactEmail} onChange={e => setProfile({...profile, contactEmail: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input value={profile.contactPhone} onChange={e => setProfile({...profile, contactPhone: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instagram URL</Label>
                      <Input value={profile.instagramUrl} onChange={e => setProfile({...profile, instagramUrl: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube URL</Label>
                      <Input value={profile.youtubeUrl} onChange={e => setProfile({...profile, youtubeUrl: e.target.value})} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Editor */}
          <TabsContent value="classes">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Add Class Form */}
              <Card className="md:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Add New Class</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddClass} className="space-y-4">
                    <Input name="title" placeholder="Class Title" required />
                    <Input name="description" placeholder="Description" required />
                    <Input name="time" placeholder="Time (e.g. Mon 10:00 AM)" required />
                    <div className="grid grid-cols-2 gap-2">
                       <Input name="duration" type="number" placeholder="Mins" required />
                       <Input name="spots" type="number" placeholder="Max Spots" required />
                    </div>
                    <Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Class</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Class List */}
              <div className="md:col-span-2 space-y-4">
                {classes.map(c => (
                  <Card key={c.id} className="flex flex-row items-center justify-between p-4">
                    <div>
                      <h3 className="font-bold">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.time} • {c.maxSpots} spots</p>
                    </div>
                    <Button variant="destructive" size="icon" onClick={async () => {
                      await removeClass(c.id);
                      setClasses(await getClasses(trainerSlug || 'trainer1'));
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Certs Editor */}
          <TabsContent value="certs">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="md:col-span-1 h-fit">
                 <CardHeader>
                   <CardTitle>Add Certification</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <form onSubmit={handleAddCert} className="space-y-4">
                     <Input name="title" placeholder="Certificate Title" required />
                     <Input name="issuer" placeholder="Issuer (e.g. NASM)" required />
                     <Input name="date" type="date" required />
                     <Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Cert</Button>
                   </form>
                 </CardContent>
               </Card>

               <div className="md:col-span-2 space-y-4">
                 {certs.map(c => (
                   <Card key={c.id} className="flex flex-row items-center justify-between p-4">
                     <div>
                       <h3 className="font-bold">{c.title}</h3>
                       <p className="text-sm text-muted-foreground">{c.issuer} • {c.date}</p>
                     </div>
                     <Button variant="destructive" size="icon" onClick={async () => {
                       await removeCertification(c.id);
                       setCerts(await getCertifications(trainerSlug || 'trainer1'));
                     }}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </Card>
                 ))}
               </div>
             </div>
          </TabsContent>

          {/* Transformations Editor */}
          <TabsContent value="trans">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="md:col-span-1 h-fit">
                 <CardHeader>
                   <CardTitle>Add Transformation</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <form onSubmit={handleAddTrans} className="space-y-4">
                     <Input name="clientName" placeholder="Client Name" required />
                     <Input name="description" placeholder="Description (e.g. Lost 30lbs)" required />
                     <Input name="beforeImage" placeholder="Before Image URL" defaultValue="https://via.placeholder.com/300?text=Before" required />
                     <Input name="afterImage" placeholder="After Image URL" defaultValue="https://via.placeholder.com/300?text=After" required />
                     <Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Transformation</Button>
                   </form>
                 </CardContent>
               </Card>

               <div className="md:col-span-2 space-y-4">
                 {trans.map(t => (
                   <Card key={t.id} className="flex flex-row items-center justify-between p-4">
                     <div>
                       <h3 className="font-bold">{t.clientName}</h3>
                       <p className="text-sm text-muted-foreground">{t.description}</p>
                     </div>
                     <Button variant="destructive" size="icon" onClick={async () => {
                       await removeTransformation(t.id);
                       setTrans(await getTransformations(trainerSlug || 'trainer1'));
                     }}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </Card>
                 ))}
               </div>
             </div>
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  );
}
