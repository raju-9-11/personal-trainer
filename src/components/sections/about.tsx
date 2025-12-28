'use client';

import { useData } from '@/lib/data-provider';
import { Certification, TrainerProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Award, User } from 'lucide-react';

export function About() {
  const { getProfile, getCertifications } = useData();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [certs, setCerts] = useState<Certification[]>([]);

  useEffect(() => {
    getProfile().then(setProfile);
    getCertifications().then(setCerts);
  }, [getProfile, getCertifications]);

  if (!profile) return null;

  return (
    <section id="about" className="py-24 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Bio */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <User className="text-primary h-6 w-6" />
              <span className="text-primary font-bold uppercase tracking-widest">About Me</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">{profile.name}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {profile.bio}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl border border-border/50 text-center">
                <span className="block text-3xl font-black text-primary">10+</span>
                <span className="text-sm text-muted-foreground uppercase">Years Exp.</span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border/50 text-center">
                <span className="block text-3xl font-black text-primary">500+</span>
                <span className="text-sm text-muted-foreground uppercase">Clients</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Certifications */}
          <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
          >
             <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
               <Award className="h-6 w-6 text-primary" /> Certifications & Expertise
             </h3>
             <div className="space-y-4">
               {certs.map((cert) => (
                 <Card key={cert.id} className="bg-card border-border/50 hover:border-primary transition-colors">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-base font-semibold">{cert.title}</CardTitle>
                     <Badge variant="outline">{cert.issuer}</Badge>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground">Issued: {cert.date}</p>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
