import React, { useState } from 'react';
import { useAITrainer } from './AITrainerContext';
import { Activity, Dumbbell, Quote, Droplets, Moon, Utensils, AlertTriangle, TrendingUp, TrendingDown, Target, Zap, Shield, Save, CheckCircle2, FlaskConical, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProgressRing = ({ value, label, icon: Icon, color }: { value: number, label: string, icon: any, color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-4 bg-muted/30 rounded-2xl border border-muted-foreground/10">
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
          <motion.circle
            cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeOut" }}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-8 h-8 ${color.replace('stroke-', 'text-')}`} />
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center">{label}</p>
      <p className="text-xl font-black">{value}%</p>
    </div>
  );
};

export const AITrainerDashboard = () => {
  const { profile, healthLogs, predictedPerformance, dailyQuote, isGuest, routines, migrateGuestToUser } = useAITrainer();
  const navigate = useNavigate();
  const [migrationPassword, setMigrationPassword] = useState('');
  const [showMigration, setShowMigration] = useState(false);

  if (!profile) return null;

  const latestLog = healthLogs[healthLogs.length - 1] || {};
  const prevLog = healthLogs[healthLogs.length - 2];
  const thisWeekLogs = healthLogs.slice(-7);
  const consistency = thisWeekLogs.length;

  const weightTrend = prevLog && latestLog.weight && prevLog.weight
    ? latestLog.weight < prevLog.weight ? 'down' : latestLog.weight > prevLog.weight ? 'up' : 'stable'
    : 'none';

  const activeRoutine = routines.find(r => r.status === 'active');

  const handleMigration = async () => {
      if (migrationPassword.length < 6) return;
      navigate('/admin/login?redirect=ai'); 
      // In a real flow, we'd wait for login then call migrateGuestToUser
      // For this prototype, we'll prompt them to log in first.
  };

  return (
    <div className="space-y-6">
      
      {/* Guest Mode Banner */}
      {isGuest && (
        <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                        <p className="text-sm font-bold text-orange-500">Unregistered Neural Link</p>
                        <p className="text-xs text-muted-foreground">Your data is stored locally. Sign in to permanently encrypt and save your vault.</p>
                    </div>
                </div>
                <Button size="sm" variant="outline" className="border-orange-500/50 hover:bg-orange-500/20" onClick={() => navigate('/admin/login')}>
                    <Save className="w-4 h-4 mr-2" /> Save Vault
                </Button>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Capacity Card */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary/30 via-primary/5 to-transparent border-primary/20 shadow-2xl shadow-primary/10">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-48 h-48 text-primary" /></div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
               <div className="absolute inset-2 rounded-full border-2 border-primary/40"></div>
               <div className="text-center">
                  <span className="text-5xl font-black tracking-tighter text-primary">{predictedPerformance || '85'}</span>
                  <span className="text-xl font-bold text-primary">%</span>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Capacity</p>
               </div>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                   <Shield className="w-6 h-6 text-primary" /> Neural Performance Status
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                   Your capacity is {predictedPerformance ? 'calculated based on biometric telemetry' : 'currently at baseline'}. 
                   {latestLog?.cnsFatigueScore && latestLog.cnsFatigueScore > 7 ? " Warning: High CNS fatigue detected." : " Systems optimized for training."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                 <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase text-primary border border-primary/20">Recovery Active</span>
                 <span className="px-3 py-1 bg-green-500/10 rounded-full text-[10px] font-bold uppercase text-green-500 border border-green-500/20">Data Synced</span>
                 {!isGuest && <span className="px-3 py-1 bg-blue-500/10 rounded-full text-[10px] font-bold uppercase text-blue-500 border border-blue-500/20">E2E Encrypted</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Motivation */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
            <Quote className="w-10 h-10 text-primary/20 mb-4" />
            <p className="text-xl italic font-serif leading-relaxed text-foreground/90">
              "{dailyQuote || "The only way to finish is to start. Your goals are waiting for your actions, not your excuses."}"
            </p>
            <div className="mt-8 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">{profile.name[0]}</div>
               <div>
                  <p className="text-sm font-bold">{profile.name}</p>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">AI Lead Strategist</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Telemetry & Active Protocol Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Training Protocol */}
          <Card className="bg-card border-primary/20 shadow-md">
              <CardHeader className="border-b pb-4">
                  <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2 text-lg">
                          <Dumbbell className="w-5 h-5 text-primary" /> Active Protocol
                      </CardTitle>
                      {activeRoutine && <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded">{activeRoutine.timeframe}</span>}
                  </div>
              </CardHeader>
              <CardContent className="pt-4">
                  {!activeRoutine ? (
                      <div className="text-center py-8 text-muted-foreground">
                          <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No active protocol.</p>
                          <p className="text-xs">Ask your trainer to generate a daily or weekly routine.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <p className="text-xs italic text-muted-foreground">Rationale: {activeRoutine.rationale}</p>
                          <div className="space-y-2">
                              {activeRoutine.exercises.map((ex, i) => (
                                  <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-muted">
                                      <div>
                                          <p className="text-sm font-bold">{ex.name}</p>
                                          {ex.notes && <p className="text-[10px] text-muted-foreground">{ex.notes}</p>}
                                      </div>
                                      <div className="text-right">
                                          <p className="text-sm font-bold text-primary">{ex.sets} <span className="text-muted-foreground font-normal text-xs">sets</span> x {ex.reps}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </CardContent>
          </Card>

          {/* Biometric & Supplement Stack */}
          <div className="space-y-6">
              {/* Biological Telemetry - INDEPTH ONLY */}
              {profile.trackingLevel === 'indepth' && (
                <Card className="bg-muted/10 border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <HeartPulse className="w-4 h-4 text-red-500" /> Deep Biometrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-background rounded-xl border shadow-sm">
                            <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">CNS Fatigue</p>
                            <p className="text-2xl font-black">{latestLog.cnsFatigueScore || '--'}<span className="text-xs font-normal text-muted-foreground">/10</span></p>
                        </div>
                        <div className="p-3 bg-background rounded-xl border shadow-sm">
                            <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Mood Index</p>
                            <p className="text-2xl font-black">{latestLog.moodScore || '--'}<span className="text-xs font-normal text-muted-foreground">/10</span></p>
                        </div>
                        {latestLog.testosteroneLevel && (
                            <div className="p-3 bg-background rounded-xl border shadow-sm col-span-2">
                                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Testosterone Baseline</p>
                                <p className="text-2xl font-black">{latestLog.testosteroneLevel} <span className="text-xs font-normal text-muted-foreground">ng/dL</span></p>
                            </div>
                        )}
                        {latestLog.menstrualCycleDay && (
                            <div className="p-3 bg-background rounded-xl border shadow-sm col-span-2 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Cycle Day</p>
                                    <p className="text-2xl font-black">{latestLog.menstrualCycleDay}</p>
                                </div>
                                <span className="px-2 py-1 bg-pink-500/10 text-pink-500 text-[10px] font-bold uppercase rounded border border-pink-500/20">{latestLog.menstrualPhase || 'Unknown'}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
              )}

              {/* Supplement Stack */}
              <Card className="bg-muted/10 border-none">
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-blue-500" /> Active Stack
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      {!profile.supplements || profile.supplements.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No supplements documented. Tell your trainer what you take.</p>
                      ) : (
                          <div className="flex flex-wrap gap-2">
                              {profile.supplements.map((supp, i) => (
                                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-background border rounded-lg shadow-sm">
                                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                                      <span className="text-xs font-bold">{supp.name}</span>
                                      {supp.category && <span className="text-[9px] text-muted-foreground uppercase">{supp.category}</span>}
                                  </div>
                              ))}
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>

      </div>

      {/* Recovery Rings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProgressRing value={latestLog?.dietQuality ? latestLog.dietQuality * 10 : 0} label="Diet Quality" icon={Utensils} color="stroke-green-500" />
          <ProgressRing value={latestLog?.sleepHours ? Math.min(100, (latestLog.sleepHours / 8) * 100) : 0} label="Sleep Engine" icon={Moon} color="stroke-blue-500" />
          <ProgressRing value={latestLog?.trainingIntensity ? latestLog.trainingIntensity * 10 : 0} label="Intensity" icon={Zap} color="stroke-orange-500" />
          <ProgressRing value={(consistency / 7) * 100} label="Consistency" icon={Target} color="stroke-primary" />
      </div>
    </div>
  );
};