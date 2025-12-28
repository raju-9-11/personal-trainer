'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-provider';
import { TrainerProfile, GymClass, Certification, Transformation, BrandIdentity, LandingPageContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Trash2, Plus, Save, Upload, ExternalLink, Globe } from 'lucide-react';
import { getFirebase } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { useAlert } from '@/components/ui/custom-alert';

export default function DashboardPage() {
  const { isAuthenticated, logout, trainerSlug, user, isSuperAdmin } = useAuth();
  const router = useRouter();
  const {
    getProfile, updateProfile,
    getBrandIdentity, updateBrandIdentity,
    getClasses, addClass, removeClass,
    getCertifications, addCertification, removeCertification,
    getTransformations, addTransformation, removeTransformation,
    getLandingPageContent, updateLandingPageContent
  } = useData();

  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [identity, setIdentity] = useState<BrandIdentity | null>(null);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [trans, setTrans] = useState<Transformation[]>([]);
  const [landing, setLanding] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    if (!trainerSlug && !user) return; // Wait for auth

    const loadData = async () => {
      // If Super Admin, fetch Platform Settings
      if (isSuperAdmin) {
          const l = await getLandingPageContent();
          const i = await getBrandIdentity('platform');
          setLanding(l);
          setIdentity(i);
      } else {
        // Normal Trainer
        // If trainerSlug is null, we pass undefined to services.
        // The services should return empty/default objects.
        const targetSlug = trainerSlug || undefined;

        const [p, i, c, cer, t] = await Promise.all([
            getProfile(targetSlug),
            getBrandIdentity(targetSlug),
            getClasses(targetSlug),
            getCertifications(targetSlug),
            getTransformations(targetSlug)
        ]);
        setProfile(p);
        setIdentity(i);
        setClasses(c);
        setCerts(cer);
        setTrans(t);
      }
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated, router, isSuperAdmin, trainerSlug, user, getProfile, getBrandIdentity, getClasses, getCertifications, getTransformations, getLandingPageContent]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      await updateProfile(profile);
      showAlert('Success', 'Profile updated!');
    }
  };

  const handleIdentitySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (identity) {
      await updateBrandIdentity(identity);
      showAlert('Success', 'Brand Identity updated!');
    }
  };

  const handleLandingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (landing) {
        await updateLandingPageContent(landing);
        showAlert('Success', 'Landing Page updated!');
    }
  }

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const { storage } = getFirebase();
    if (!storage) {
        console.warn("Firebase Storage not available. Using fake URL.");
        return URL.createObjectURL(file);
    }
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
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
    setClasses(await getClasses(trainerSlug || undefined));
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
    setCerts(await getCertifications(trainerSlug || undefined));
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
    setTrans(await getTransformations(trainerSlug || undefined));
    (e.target as HTMLFormElement).reset();
  };

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <header className="bg-background border-b border-border/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-bold">
               {isSuperAdmin ? 'Platform Admin' : 'Trainer Dashboard'}
           </h1>
           {!isSuperAdmin && trainerSlug && (
             <Button variant="ghost" size="sm" asChild>
               <Link href={`/${trainerSlug}`} target="_blank">
                 View My Page <ExternalLink className="ml-2 h-4 w-4" />
               </Link>
             </Button>
           )}
           {isSuperAdmin && (
             <Button variant="ghost" size="sm" asChild>
               <Link href="/" target="_blank">
                 View Platform <Globe className="ml-2 h-4 w-4" />
               </Link>
             </Button>
           )}
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground hidden md:inline-block">Logged in as {user?.email}</span>
           <Button variant="outline" onClick={() => { logout(); router.push('/'); }}>Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

        {isSuperAdmin ? (
            // SUPER ADMIN VIEW
            <Tabs defaultValue="landing">
                <TabsList className="mb-8">
                    <TabsTrigger value="landing">Landing Page</TabsTrigger>
                    <TabsTrigger value="identity">Global Identity</TabsTrigger>
                </TabsList>

                <TabsContent value="landing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Landing Page Content</CardTitle>
                            <CardDescription>Edit the main hero section of the home page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {landing && (
                                <form onSubmit={handleLandingSave} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Hero Title</Label>
                                        <Input value={landing.heroTitle} onChange={e => setLanding({...landing, heroTitle: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hero Subtitle</Label>
                                        <Input value={landing.heroSubtitle} onChange={e => setLanding({...landing, heroSubtitle: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hero Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input value={landing.heroImageUrl} onChange={e => setLanding({...landing, heroImageUrl: e.target.value})} />
                                            <Label htmlFor="upload-hero" className="cursor-pointer bg-secondary px-4 py-2 rounded flex items-center justify-center">
                                                <Upload className="h-4 w-4" />
                                            </Label>
                                            <Input id="upload-hero" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = await uploadImage(file, `platform/hero_${Date.now()}`);
                                                    setLanding({...landing, heroImageUrl: url});
                                                }
                                            }} />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full"><Save className="mr-2 h-4 w-4" /> Save Landing Page</Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="identity">
                     <Card>
                        <CardHeader>
                            <CardTitle>Platform Brand Identity</CardTitle>
                            <CardDescription>Default branding for the platform.</CardDescription>
                        </CardHeader>
                         <CardContent>
                            {identity && (
                              <form onSubmit={handleIdentitySave} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Brand Name</Label>
                                    <Input value={identity.brandName} onChange={e => setIdentity({...identity, brandName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo</Label>
                                    <div className="flex gap-4 items-center">
                                        {identity.logoUrl && <Image src={identity.logoUrl} alt="Logo" width={64} height={64} className="object-contain border p-1 rounded" />}
                                        <Input type="file" accept="image/*" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = await uploadImage(file, `platform/logo_${Date.now()}`);
                                                setIdentity({...identity, logoUrl: url});
                                            }
                                        }} />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full"><Save className="mr-2 h-4 w-4" /> Save Identity</Button>
                              </form>
                            )}
                          </CardContent>
                     </Card>
                </TabsContent>
            </Tabs>
        ) : (
            // TRAINER VIEW
            !profile ? (
                <div className="text-center py-12">
                     <h2 className="text-xl font-bold text-destructive mb-2">Profile Not Found</h2>
                     <p className="text-muted-foreground">We couldn't load your profile data. Please refresh or contact support.</p>
                </div>
            ) : (
                <Tabs defaultValue="profile">
                  <TabsList className="mb-8 flex flex-wrap h-auto gap-2">
                    <TabsTrigger value="identity">Identity</TabsTrigger>
                    <TabsTrigger value="profile">Profile & Hero</TabsTrigger>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                    <TabsTrigger value="certs">Certifications</TabsTrigger>
                    <TabsTrigger value="trans">Transformations</TabsTrigger>
                  </TabsList>

                  {/* Identity Editor */}
                  <TabsContent value="identity">
                    <Card>
                      <CardHeader>
                        <CardTitle>Brand Identity</CardTitle>
                        <CardDescription>Manage your brand&apos;s look and feel.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {identity && (
                          <form onSubmit={handleIdentitySave} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Brand Name</Label>
                                <Input value={identity.brandName} onChange={e => setIdentity({...identity, brandName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Logo</Label>
                                <div className="flex gap-4 items-center">
                                    {identity.logoUrl && <Image src={identity.logoUrl} alt="Logo" width={64} height={64} className="object-contain border p-1 rounded" />}
                                    <Input type="file" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = await uploadImage(file, `brand/logo_${Date.now()}`);
                                            setIdentity({...identity, logoUrl: url});
                                        }
                                    }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <div className="flex gap-2">
                                        <Input type="color" className="w-12 p-1 h-10" value={identity.primaryColor} onChange={e => setIdentity({...identity, primaryColor: e.target.value})} />
                                        <Input value={identity.primaryColor} onChange={e => setIdentity({...identity, primaryColor: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary Color</Label>
                                     <div className="flex gap-2">
                                        <Input type="color" className="w-12 p-1 h-10" value={identity.secondaryColor} onChange={e => setIdentity({...identity, secondaryColor: e.target.value})} />
                                        <Input value={identity.secondaryColor} onChange={e => setIdentity({...identity, secondaryColor: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full"><Save className="mr-2 h-4 w-4" /> Save Identity</Button>
                          </form>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

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
                              setClasses(await getClasses(trainerSlug || undefined));
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
                               setCerts(await getCertifications(trainerSlug || undefined));
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

                             <div className="space-y-2">
                               <Label>Before Image</Label>
                               <div className="flex gap-2 items-center">
                                  <Input name="beforeImage" placeholder="Image URL" required />
                                  <Label htmlFor="upload-before" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded inline-flex items-center justify-center">
                                     <Upload className="h-4 w-4" />
                                  </Label>
                                  <Input id="upload-before" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                          const url = await uploadImage(file, `transformations/before_${Date.now()}`);
                                          const input = document.getElementsByName('beforeImage')[0] as HTMLInputElement;
                                          if (input) input.value = url;
                                      }
                                  }} />
                               </div>
                             </div>

                             <div className="space-y-2">
                               <Label>After Image</Label>
                               <div className="flex gap-2 items-center">
                                  <Input name="afterImage" placeholder="Image URL" required />
                                  <Label htmlFor="upload-after" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded inline-flex items-center justify-center">
                                     <Upload className="h-4 w-4" />
                                  </Label>
                                  <Input id="upload-after" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                          const url = await uploadImage(file, `transformations/after_${Date.now()}`);
                                          const input = document.getElementsByName('afterImage')[0] as HTMLInputElement;
                                          if (input) input.value = url;
                                      }
                                  }} />
                               </div>
                             </div>

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
                               setTrans(await getTransformations(trainerSlug || undefined));
                             }}>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </Card>
                         ))}
                       </div>
                     </div>
                  </TabsContent>
                </Tabs>
            )
        )}
      </main>
    </div>
  );
}
