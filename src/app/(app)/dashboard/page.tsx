'use client';

import { useEffect, useState } from 'react';
import { getAllIssues, getAllUsers } from '@/lib/firestore';
import { Card, LoadingScreen } from '@/components/ui';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Issue, AppUser } from '@/lib/utils';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllIssues(), getAllUsers()])
      .then(([i, u]) => { setIssues(i); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  const total = issues.length;
  const byStatus = (s: string) => issues.filter((i) => i.status === s).length;
  
  const userMap: Record<string, string> = {};
  users.forEach((u) => (userMap[u.uid] = u.displayName));

  const chartData = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
      data: [byStatus('Open'), byStatus('In Progress'), byStatus('Resolved'), byStatus('Closed')],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#94a3b8'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Dashboard</h1>
        <p className="text-slate-500 mt-1">Project overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bugs', value: total, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Open', value: byStatus('Open'), icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'In Progress', value: byStatus('In Progress'), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Done', value: byStatus('Resolved') + byStatus('Closed'), icon: CheckCircle, color: 'text-primary-600', bg: 'bg-primary-100' }
        ].map((k, i) => (
          <Card key={i} hover className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${k.bg} ${k.color}`}><k.icon size={24} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{k.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{k.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-slate-800 mb-4 font-heading">Status Distribution</h3>
          <div className="h-64 flex justify-center">
             {total > 0 ? <Doughnut data={chartData} options={{ maintainAspectRatio: false, cutout: '70%' }} /> : <p className="text-slate-400 mt-10">No data</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
