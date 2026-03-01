import React from 'react';
import { useAITrainer } from './AITrainerContext';
import { Activity, Dumbbell, Quote, Droplets, Moon, Utensils, AlertTriangle, TrendingUp, TrendingDown, Target, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { motion } from 'framer-motion';

const ProgressRing = ({ value, label, icon: Icon, color }: { value: number, label: string, icon: any, color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-4 bg-muted/30 rounded-2xl border border-muted-foreground/10">
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/20"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-8 h-8 ${color.replace('stroke-', 'text-')}`} />
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xl font-black">{value}%</p>
    </div>
  );
};

export const AITrainerDashboard = () => {
  const { profile, healthLogs, predictedPerformance, dailyQuote } = useAITrainer();

  if (!profile) return null;

  // Derive stats
  const latestLog = healthLogs[healthLogs.length - 1];
  const prevLog = healthLogs[healthLogs.length - 2];
  const thisWeekLogs = healthLogs.slice(-7);
  const consistency = thisWeekLogs.length;

  // Simple Trend logic
  const weightTrend = prevLog && latestLog && latestLog.weight && prevLog.weight
    ? latestLog.weight < prevLog.weight ? 'down' : latestLog.weight > prevLog.weight ? 'up' : 'stable'
    : 'none';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Capacity Card */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary/30 via-primary/5 to-transparent border-primary/20 shadow-2xl shadow-primary/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Zap className="w-48 h-48 text-primary" />
          </div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
               <div className="absolute inset-2 rounded-full border-2 border-primary/40"></div>
               <div className="text-center">
                  <span className="text-5xl font-black tracking-tighter text-primary">
                    {predictedPerformance || '85'}
                  </span>
                  <span className="text-xl font-bold text-primary">%</span>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Capacity</p>
               </div>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                   <Shield className="w-6 h-6 text-primary" />
                   Neural Performance Status
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                   Your capacity is {predictedPerformance ? 'calculated based on biometric telemetry' : 'currently at baseline'}. 
                   {latestLog?.sleepHours && latestLog.sleepHours < 7 ? " Warning: Sleep deficit detected." : " Systems optimized for training."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                 <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase text-primary border border-primary/20">Recovery Active</span>
                 <span className="px-3 py-1 bg-green-500/10 rounded-full text-[10px] font-bold uppercase text-green-500 border border-green-500/20">Data Synced</span>
                 <span className="px-3 py-1 bg-blue-500/10 rounded-full text-[10px] font-bold uppercase text-blue-500 border border-blue-500/20">E2E Encrypted</span>
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
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                  {profile.name[0]}
               </div>
               <div>
                  <p className="text-sm font-bold">{profile.name}</p>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">AI Lead Strategist</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Rings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProgressRing value={latestLog?.dietQuality ? latestLog.dietQuality * 10 : 0} label="Diet Quality" icon={Utensils} color="stroke-green-500" />
          <ProgressRing value={latestLog?.sleepHours ? Math.min(100, (latestLog.sleepHours / 8) * 100) : 0} label="Sleep Engine" icon={Moon} color="stroke-blue-500" />
          <ProgressRing value={latestLog?.trainingIntensity ? latestLog.trainingIntensity * 10 : 0} label="Intensity" icon={Zap} color="stroke-orange-500" />
          <ProgressRing value={(consistency / 7) * 100} label="Consistency" icon={Target} color="stroke-primary" />
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-muted/20 border-none shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Body Metrics</p>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-end gap-3">
               <h4 className="text-4xl font-black">{latestLog?.weight || profile.baselineWeight || '--'}<span className="text-sm ml-1 text-muted-foreground">kg</span></h4>
               {weightTrend === 'down' && <span className="mb-2 flex items-center text-green-500 font-bold text-xs"><TrendingDown className="w-4 h-4 mr-1" /> Lean Transition</span>}
               {weightTrend === 'up' && <span className="mb-2 flex items-center text-orange-500 font-bold text-xs"><TrendingUp className="w-4 h-4 mr-1" /> Mass Gain</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/20 border-none shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sync History</p>
              <Dumbbell className="w-4 h-4 text-primary" />
            </div>
            <h4 className="text-4xl font-black">{consistency}<span className="text-sm ml-1 text-muted-foreground">days</span></h4>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">Consecutive training telemetry received</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 border-none shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Strategic Goal</p>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-bold line-clamp-2">{profile.goals[0]}</p>
            <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-primary w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};