import React from 'react';
import { useAITrainer } from './AITrainerContext';
import { Activity, Dumbbell, Quote, Droplets, Moon, Utensils, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const AITrainerDashboard = () => {
  const { profile, healthLogs, predictedPerformance, dailyQuote } = useAITrainer();

  if (!profile) return null;

  // Derive stats
  const latestLog = healthLogs[healthLogs.length - 1];
  const thisWeekLogs = healthLogs.slice(-7);
  const consistency = thisWeekLogs.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Performance Prediction */}
        <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center space-x-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <Activity className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's Predicted Capacity</p>
              <h3 className="text-4xl font-bold mt-1">
                {predictedPerformance ? `${predictedPerformance}%` : "Calculating..."}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Based on recent sleep, diet, and training intensity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Quote */}
        <Card className="col-span-1 lg:col-span-2">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <Quote className="w-6 h-6 text-primary/40 mb-2" />
            <p className="text-lg italic font-medium">
              "{dailyQuote || "The body achieves what the mind believes."}"
            </p>
            <p className="text-sm text-right text-muted-foreground mt-2">- {profile.name}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-muted-foreground">Current Weight</p>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <h4 className="text-2xl font-bold">{latestLog?.weight || profile.baselineWeight || '--'} kg</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-muted-foreground">Consistency</p>
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </div>
            <h4 className="text-2xl font-bold">{consistency} days</h4>
            <p className="text-xs text-muted-foreground">Logged this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-muted-foreground">Last Sleep</p>
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
            <h4 className="text-2xl font-bold">{latestLog?.sleepHours || '--'} hrs</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-muted-foreground">Diet Quality</p>
              <Utensils className="w-4 h-4 text-muted-foreground" />
            </div>
            <h4 className="text-2xl font-bold">{latestLog?.dietQuality ? `${latestLog.dietQuality}/10` : '--'}</h4>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};