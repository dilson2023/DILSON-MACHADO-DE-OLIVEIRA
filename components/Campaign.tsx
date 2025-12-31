
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, CheckCircle2, Terminal as TerminalIcon, AlertTriangle, Users, Code, Zap, CheckSquare, Square, WifiOff, Coins, Info } from 'lucide-react';
import { Contact, SMSLog } from '../types';
import { API, broadcastLog } from '../services/api';
import { useApp } from '../App';

interface CampaignProps {
  contacts: Contact[];
  addLog: (log: SMSLog) => void;
}

const Campaign: React.FC<CampaignProps> = ({ contacts, addLog }) => {
  const { t, lang, credits, setCredits, isOnline } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'completed' | 'error'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(contacts.filter(c => c.active).map(c => c.id));
  const [useAI, setUseAI] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const activeRecipients = contacts.filter(c => selectedIds.includes(c.id));
  const baseCost = activeRecipients.length;
  const aiCost = useAI ? activeRecipients.length : 0;
  const totalCost = baseCost + aiCost;

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const pushTerminal = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    let color = '';
    if (type === 'error') color = 'text-red-500';
    if (type === 'success') color = 'text-green-400';
    setTerminalLogs(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] <span class="${color}">${msg}</span>`]);
  };

  const toggleRecipient = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const startSending = async () => {
    if (!aiPrompt || activeRecipients.length === 0) return;
    if (credits < totalCost) {
      pushTerminal(lang === 'en' ? "CRITICAL: Insufficient credits for this operation." : "CRÍTICO: Créditos insuficientes para esta operação.", 'error');
      return;
    }
    
    setStatus('sending');
    setTerminalLogs([]);
    pushTerminal("HANDSHAKE: INITIATING ELITE BROADCAST ENGINE...");
    pushTerminal(`MONEY MODE: ESTIMATED COST ${totalCost} CREDITS.`);

    try {
      // Aligned with user requested structure: objective, contacts, useAI
      pushTerminal(`API REQ: POST /api/sms/send | TARGETS: ${activeRecipients.length}`, 'info');

      // Use the actual API call
      const response = await API.sendBatch(aiPrompt, activeRecipients, useAI);

      if (response.success) {
        for (const res of response.results) {
          const log: SMSLog = {
            id: Math.random().toString(36).substr(2, 9),
            phone: res.phone,
            message: res.message,
            status: 'sent',
            timestamp: Date.now(),
            type: 'outbound'
          };
          
          addLog(log);
          broadcastLog(log);
          setCredits(prev => prev - (useAI ? 2 : 1));
          pushTerminal(`TX OK: ${res.phone} | STATUS: DELIVERED`, 'success');
          await new Promise(r => setTimeout(r, 100));
        }
        setStatus('completed');
        pushTerminal("TRANSMISSION SEQUENCE COMPLETED. ALL NODES SYNCED.", 'success');
      }
    } catch (err) {
      setStatus('error');
      pushTerminal("ERROR: Backend connection refused (Port 3001).", 'error');
      pushTerminal("SYSTEM: Operating in DEMO MODE.", 'info');
      
      // Demo fallback logic
      setTimeout(async () => {
        for (const c of activeRecipients) {
          const log: SMSLog = { id: Math.random().toString(36).substr(2, 9), phone: c.phone, message: "AI Generated Demo Message", status: 'sent', timestamp: Date.now(), type: 'outbound' };
          addLog(log);
          setCredits(prev => prev - (useAI ? 2 : 1));
          pushTerminal(`DEMO TX: ${c.phone} | ${useAI ? 'AI-COST-DEBITED' : 'STD-DEBIT'}`, 'info');
          await new Promise(r => setTimeout(r, 100));
        }
        setStatus('completed');
      }, 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      <div className="flex items-end justify-between border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Command <span className="text-indigo-500">Center</span></h2>
          <p className="text-zinc-500 font-medium">Enterprise AI-Driven Campaign Gateway.</p>
        </div>
        <div className="flex gap-4">
           <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${credits < totalCost ? 'bg-red-500/10 border-red-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
              <Coins size={14} className={credits < totalCost ? 'text-red-500' : 'text-indigo-400'} />
              <div className="flex flex-col">
                 <span className="text-[8px] font-black uppercase text-zinc-500">Operation Cost</span>
                 <span className={`text-xs font-mono font-bold ${credits < totalCost ? 'text-red-500' : 'text-white'}`}>{totalCost} Credits</span>
              </div>
           </div>
           {!isOnline && (
              <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                 <WifiOff size={14} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Demo Mode</span>
              </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Selection */}
        <div className="lg:col-span-3 bg-[#0a0a0c] border border-zinc-800 rounded-3xl p-6 shadow-2xl h-[640px] flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                 <Users size={14} className="text-indigo-400" />
                 {t('campaign_select_recipients')}
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-widest">{selectedIds.length}</span>
           </div>
           <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {contacts.map(contact => (
                <div 
                  key={contact.id} 
                  onClick={() => toggleRecipient(contact.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                    selectedIds.includes(contact.id) 
                      ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' 
                      : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-800/50'
                  }`}
                >
                   {selectedIds.includes(contact.id) ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} className="text-zinc-700" />}
                   <div className="flex flex-col overflow-hidden">
                      <span className={`text-xs font-bold truncate ${selectedIds.includes(contact.id) ? 'text-white' : 'text-zinc-500'}`}>{contact.name}</span>
                      <span className="text-[9px] font-mono text-zinc-600 italic">{contact.phone}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Editor Side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a0a0c] border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full transition-all group-hover:bg-indigo-500/10" />
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <Sparkles size={20} className="text-indigo-400" />
                   <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-200">{t('campaign_logic')}</h3>
                </div>
                <div 
                  onClick={() => setUseAI(!useAI)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${useAI ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                >
                   <Zap size={14} className={useAI ? 'fill-indigo-400' : ''} />
                   <span className="text-[10px] font-black uppercase">AI Mode {useAI ? 'ON' : 'OFF'}</span>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">{lang === 'en' ? 'Campaign Context (Target Goal)' : 'Contexto da Campanha (Objetivo)'}</label>
                  <textarea 
                    placeholder={t('campaign_ai_placeholder')}
                    className="w-full bg-[#111113] border border-zinc-800 rounded-2xl px-5 py-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all h-48 resize-none shadow-inner leading-relaxed font-medium"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Transmission Cost</span>
                      <span>{baseCost} Credits</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-500">
                      <span>AI Premium Protocol</span>
                      <span>{aiCost} Credits</span>
                   </div>
                   <div className="h-[1px] bg-zinc-800 my-2" />
                   <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-white">
                      <span>Total Estimated</span>
                      <span>{totalCost} Credits</span>
                   </div>
                </div>
             </div>
          </div>
          
          <button 
            onClick={startSending}
            disabled={status === 'sending' || !aiPrompt || activeRecipients.length === 0 || credits < totalCost}
            className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-lg transition-all flex items-center justify-center gap-3 shadow-2xl ${
              status === 'sending' || credits < totalCost
                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-indigo-500/20 active:scale-[0.98]'
            }`}
          >
            {status === 'sending' ? <Loader2 className="animate-spin" /> : <Send size={24} />}
            {credits < totalCost ? "INSUFFICIENT FUNDS" : status === 'sending' ? "TRANSMITTING..." : "INITIALIZE BLAST"}
          </button>
        </div>

        {/* Terminal Side */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#050506] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl h-[640px] flex flex-col">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase ml-3 tracking-[0.2em] flex items-center gap-2">
                  <TerminalIcon size={12} className="text-indigo-500" />
                  SaaS Gateway Console
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] leading-relaxed text-indigo-400/90 bg-[#08080a] selection:bg-indigo-500/30 scrollbar-thin">
              {terminalLogs.length === 0 ? (
                <div className="text-zinc-800 italic opacity-40">
                   {'>'} SYSTEM READY...<br/>
                   {'>'} BACKEND STATUS: {isOnline ? 'ONLINE' : 'DEMO'}<br/>
                   {'>'} WAITING FOR TRANSACTION...
                </div>
              ) : (
                terminalLogs.map((log, idx) => (
                  <div key={idx} className="mb-1.5 animate-in fade-in slide-in-from-left-2 duration-300" dangerouslySetInnerHTML={{ __html: `<span class="text-zinc-700 font-bold mr-3">&gt;</span>${log}` }} />
                ))
              )}
              <div ref={terminalEndRef} />
            </div>

            {status === 'sending' && (
              <div className="p-5 bg-zinc-900/50 border-t border-zinc-800">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-[9px] font-black text-zinc-600 tracking-widest uppercase italic">Node Broadcast</span>
                   <span className="text-[10px] font-mono text-indigo-400 font-bold">ACTIVE</span>
                 </div>
                 <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-progress-fast" style={{ width: '85%' }} />
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaign;
