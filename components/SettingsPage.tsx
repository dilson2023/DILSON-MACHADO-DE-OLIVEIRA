
import React, { useState } from 'react';
import { Shield, Lock, Bell, Globe, Save, Code, Terminal, Key, Bot, Ban } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('sk-elite-••••••••••••••••');
  const [webhook, setWebhook] = useState('http://localhost:3001/api/sms/callback');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="border-b border-zinc-800 pb-6">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">System <span className="text-indigo-500">Settings</span></h2>
        <p className="text-zinc-500 font-medium">Configure your SaaS infrastructure and API keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-[#0a0a0c] border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
               <Key size={14} className="text-indigo-400" />
               Security Protocols
            </h3>
            
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Gemini Cloud API Key</label>
                  <div className="relative">
                     <input 
                        type="password" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                     />
                     <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">SaaS Webhook Endpoint</label>
                  <div className="relative">
                     <input 
                        type="text" 
                        value={webhook} 
                        onChange={(e) => setWebhook(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                     />
                     <Code size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-[#0a0a0c] border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
               <Bot size={14} className="text-indigo-400" />
               Automation Bot
            </h3>
            <div className="space-y-4">
               {[
                  { label: 'Auto Opt-out Bot', active: true, icon: <Ban size={12} /> },
                  { label: 'Keyword Detection', active: true, icon: <Code size={12} /> },
                  { label: 'AI Response Agent', active: false, icon: <Bot size={12} /> },
                  { label: 'Smart Filtering', active: true, icon: <Shield size={12} /> },
               ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                     <div className="flex items-center gap-2">
                        <span className="text-zinc-600">{item.icon}</span>
                        <span className="text-xs font-bold text-zinc-400">{item.label}</span>
                     </div>
                     <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${item.active ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="bg-[#0a0a0c] border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
               <Bell size={14} className="text-indigo-400" />
               Global Notifications
            </h3>
            <div className="space-y-4">
               {[
                  { label: 'Push on Delivery', active: true },
                  { label: 'Low Credit Alert', active: true },
                  { label: 'API Error Webhooks', active: false },
                  { label: 'Incoming SMS Alert', active: true },
               ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                     <span className="text-xs font-bold text-zinc-400">{item.label}</span>
                     <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${item.active ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                     </div>
                  </div>
               ))}
            </div>
         </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
               <Terminal size={24} />
            </div>
            <div>
               <h4 className="font-bold text-white tracking-tight">Enterprise Configuration</h4>
               <p className="text-xs text-zinc-500">Changes take effect immediately on all connected cluster nodes.</p>
            </div>
         </div>
         <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20">
            <Save size={16} />
            Commit Changes
         </button>
      </div>
    </div>
  );
};

export default SettingsPage;
