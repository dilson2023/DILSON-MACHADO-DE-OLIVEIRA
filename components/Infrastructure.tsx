
import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, Cpu, Globe, ShieldCheck, Zap } from 'lucide-react';
// Corrected import: Changed MockAPI to API which is the exported member in services/api.ts
import { API } from '../services/api';
// Fixed: Changed useLang to useApp as it is the correct exported hook from App.tsx
import { useApp } from '../App';

const Infrastructure: React.FC = () => {
  // Fixed: Changed useLang() to useApp() to fix the import error
  const { t, lang } = useApp();
  
  // Initial state with default nodes to prevent mapping errors before async data is fetched
  const [data, setData] = useState<{ nodes: any[] }>({
    nodes: [
      { id: 'ALPHA-01', status: 'online', load: 0, uptime: '0d 0h' },
      { id: 'BETA-02', status: 'online', load: 0, uptime: '0d 0h' },
      { id: 'GAMMA-03', status: 'standby', load: 0, uptime: '0d 0h' },
    ]
  });

  useEffect(() => {
    // Function to fetch infrastructure health asynchronously from the API
    const fetchHealth = async () => {
      try {
        const result = await API.getGatewayHealth();
        // Ensure the result contains nodes before updating state
        if (result && 'nodes' in result) {
          setData(result as any);
        }
      } catch (error) {
        console.error("Failed to fetch gateway health:", error);
      }
    };

    fetchHealth();
    // Poll the health status every 3 seconds
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">{t('infra_title').split(' ')[0]} <span className="text-indigo-500">{t('infra_title').split(' ').slice(1).join(' ')}</span></h2>
          <p className="text-zinc-500 font-medium">{t('infra_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
           <ShieldCheck size={14} className="text-green-500" />
           <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">{t('infra_verified')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data.nodes.map(node => (
          <div key={node.id} className="bg-[#0a0a0c]/80 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${node.status === 'online' ? 'text-indigo-400' : 'text-zinc-600'}`}>
                      <Server size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-sm">{node.id}</h4>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase">{node.uptime} {t('infra_uptime')}</p>
                   </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-zinc-800'}`} />
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                   <span className="text-zinc-500 font-medium uppercase tracking-tighter">{t('infra_load')}</span>
                   <span className="text-white font-mono">{node.load}%</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${node.load > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${node.load}%` }} 
                   />
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
         <div className="bg-[#0a0a0c]/80 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl space-y-6">
            <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-2">
               <Database size={16} className="text-indigo-400" />
               {t('infra_env')}
            </h3>
            <div className="space-y-4 font-mono text-xs">
               <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                  <span className="text-zinc-600">Runtime</span>
                  <span className="text-white">Node.js 20.x v8-turbo</span>
               </div>
               <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                  <span className="text-zinc-600">API Latency</span>
                  <span className="text-indigo-400">1.2ms (Intra-cluster)</span>
               </div>
               <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                  <span className="text-zinc-600">Gateway Driver</span>
                  <span className="text-white">AT+SIM-900-V2</span>
               </div>
               <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                  <span className="text-zinc-600">Encapsulation</span>
                  <span className="text-zinc-400 italic">Docker Hybrid (Mock)</span>
               </div>
            </div>
         </div>

         <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-8 rounded-[2rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
               <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Active Scaling Protocol</h3>
            <p className="text-sm text-zinc-500 max-w-xs">{lang === 'en' ? 'The gateway cluster automatically re-routes traffic during carrier congestion.' : 'O cluster gateway redireciona o tráfego automaticamente durante congestionamentos.'}</p>
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
               Force Re-balance
            </button>
         </div>
      </div>
    </div>
  );
};

export default Infrastructure;
