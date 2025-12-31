
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Send, CheckCircle, Activity, ShieldAlert, Cpu, Globe } from 'lucide-react';
import { Contact, SMSLog } from '../types';
// Fixed: Changed useLang to useApp as it is the correct exported hook from App.tsx
import { useApp } from '../App';

interface DashboardProps {
  contacts: Contact[];
  logs: SMSLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ contacts, logs }) => {
  // Fixed: Changed useLang() to useApp()
  const { t, lang } = useApp();
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const activeContacts = contacts.filter(c => c.active).length;
  const sentCount = logs.filter(l => l.status === 'sent').length;

  useEffect(() => {
    const events = lang === 'en' ? [
      "DB: Index optimized in 4ms.",
      "GW: Cluster Alpha load balanced.",
      "API: Received 200 OK from local node.",
      "AUTH: Session validated.",
      "SMS: Buffer flushed.",
    ] : [
      "BD: Índice otimizado em 4ms.",
      "GW: Cluster Alpha balanceado.",
      "API: Recebido 200 OK do nó local.",
      "AUTH: Sessão validada.",
      "SMS: Buffer esvaziado.",
    ];
    
    const interval = setInterval(() => {
      const msg = events[Math.floor(Math.random() * events.length)];
      setLiveLog(prev => [msg, ...prev.slice(0, 4)]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [lang]);

  const chartData = [
    { name: '00:00', sent: 400 },
    { name: '04:00', sent: 300 },
    { name: '08:00', sent: 800 },
    { name: '12:00', sent: 500 },
    { name: '16:00', sent: 900 },
    { name: '20:00', sent: 1200 },
    { name: '23:59', sent: 1100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">{t('dash_title').split(' ')[0]} <span className="text-indigo-500">{t('dash_title').split(' ').slice(1).join(' ')}</span></h2>
          <p className="text-zinc-500 font-medium">{t('dash_subtitle')}</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3">
              <Cpu size={18} className="text-indigo-400" />
              <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">CPU LOAD</span>
                 <span className="text-xs font-mono text-white">22.8%</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dash_stat_leads')} value={contacts.length.toString()} icon={<Users size={20}/>} color="blue" />
        <StatCard label={t('dash_stat_ready')} value={activeContacts.toString()} icon={<CheckCircle size={20}/>} color="green" />
        <StatCard label={t('dash_stat_requests')} value={logs.length.toString()} icon={<Send size={20}/>} color="indigo" />
        <StatCard label={t('dash_stat_tier')} value="Elite" icon={<Activity size={20}/>} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0a0a0c]/50 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-20 -mt-20" />
          <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 mb-8 flex items-center gap-2">
             <Activity size={14} className="text-indigo-500" />
             {t('dash_throughput')}
          </h3>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} fontStyle="italic" />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#0a0a0c]/50 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl h-full">
              <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 mb-6 flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" />
                {t('dash_telemetry')}
              </h3>
              <div className="space-y-4">
                 {logs.slice(0, 8).map((log, i) => (
                    <div key={i} className="flex gap-3 animate-in slide-in-from-right-2 fade-in duration-300">
                       <div className={`w-1 h-1 rounded-full mt-2 shrink-0 ${log.status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`} />
                       <p className="text-[10px] font-mono text-zinc-400 leading-tight">
                         [{new Date(log.timestamp).toLocaleTimeString()}] REQ_{log.id.toUpperCase()} -> {log.phone}
                       </p>
                    </div>
                 ))}
                 {logs.length === 0 && (
                    <p className="text-zinc-600 italic text-xs">{t('dash_waiting')}</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/10',
    red: 'text-red-500 bg-red-500/10'
  };

  return (
    <div className="bg-[#0a0a0c]/50 border border-zinc-800 p-6 rounded-[1.5rem] hover:border-zinc-700 transition-all hover:-translate-y-1 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <div className="text-3xl font-black italic tracking-tighter text-white">{value}</div>
    </div>
  );
};

export default Dashboard;
