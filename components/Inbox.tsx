
import React, { useState, useEffect } from 'react';
import { Search, Send, User, Bot, Sparkles, Filter, Trash2, CheckCircle, MessageSquare, Ban, Info, AlertCircle, Zap, Coins, Loader2 } from 'lucide-react';
import { Contact, SMSLog } from '../types';
import { GoogleGenAI } from "@google/genai";
import { useApp } from '../App';
import { API } from '../services/api';
import { generateChatbotResponse } from '../services/geminiService';

interface InboxProps {
  logs: SMSLog[];
  setLogs: React.Dispatch<React.SetStateAction<SMSLog[]>>;
  contacts: Contact[];
}

const Inbox: React.FC<InboxProps> = ({ logs, setLogs, contacts }) => {
  const { updateContact, setCredits, credits } = useApp();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isAiAgentActive, setIsAiAgentActive] = useState(true);

  const selectedContact = contacts.find(c => c.phone === selectedThread);
  const isInactive = selectedContact && !selectedContact.active;

  // Group logs by phone number to create threads
  const threads = Array.from(new Set(logs.map(l => l.phone))).map(phone => {
    const contact = contacts.find(c => c.phone === phone);
    const contactLogs = logs.filter(l => l.phone === phone);
    const lastLog = contactLogs.sort((a, b) => b.timestamp - a.timestamp)[0];
    return {
      phone,
      name: contact ? contact.name : 'Unknown Contact',
      lastMessage: lastLog.message,
      timestamp: lastLog.timestamp,
      unread: lastLog.type === 'inbound',
      active: contact ? contact.active : true
    };
  }).sort((a, b) => b.timestamp - a.timestamp);

  const currentMessages = logs
    .filter(l => l.phone === selectedThread)
    .sort((a, b) => a.timestamp - b.timestamp);

  const handleSend = async (text: string, type: 'outbound' | 'inbound' = 'outbound', isAutoReply: boolean = false) => {
    if (!selectedThread || !text.trim()) return;
    
    // Check credits if sending (outbound)
    if (type === 'outbound' && credits <= 0) {
      console.warn("Insufficient credits for outbound message");
      return;
    }

    const newLog: SMSLog = {
      id: (isAutoReply ? 'bot-' : '') + Math.random().toString(36).substr(2, 9),
      phone: selectedThread,
      message: text,
      status: 'sent',
      timestamp: Date.now(),
      type
    };

    setLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('sms_logs', JSON.stringify(updated));
      return updated;
    });

    if (!isAutoReply) setReplyText('');
    
    // Debit credit for outbound message
    if (type === 'outbound') {
      setCredits(prev => prev - 1);
    }

    if (type === 'inbound') {
      const result = await API.receiveSMS(selectedThread, text);
      
      if (result.action === 'opt-out') {
        const contact = contacts.find(c => c.phone === selectedThread);
        if (contact) {
          updateContact(contact.id, { active: false });
        }
        
        if (result.reply) {
          setIsBotThinking(true);
          setTimeout(() => {
            const botLog: SMSLog = {
              id: 'bot-' + Math.random().toString(36).substr(2, 5),
              phone: selectedThread,
              message: result.reply!,
              status: 'sent',
              timestamp: Date.now(),
              type: 'outbound'
            };
            setLogs(prev => [botLog, ...prev]);
            setIsBotThinking(false);
            setCredits(prev => prev - 1);
          }, 1200);
        }
      } else if (isAiAgentActive && !isInactive) {
        triggerAiChatbotResponse(selectedThread);
      }
    } else if (type === 'outbound' && !isAutoReply) {
      if (!isInactive) {
        // Automatically simulate a customer reply after some time to keep the demo alive
        setTimeout(() => {
          simulateIncoming(selectedThread);
        }, 5000);
      }
    }
  };

  const triggerAiChatbotResponse = async (phone: string) => {
    setIsBotThinking(true);
    // Mimic human-like processing time
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Refetch the most current logs for this phone to ensure context is up to date
    const currentLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
    const threadLogs = currentLogs.filter((l: SMSLog) => l.phone === phone);
    const contact = contacts.find(c => c.phone === phone);
    const name = contact?.name || 'Customer';

    try {
      const aiResponse = await generateChatbotResponse(threadLogs, name);
      await handleSend(aiResponse, 'outbound', true);
    } catch (e) {
      console.error("AI Auto-Reply Error:", e);
    } finally {
      setIsBotThinking(false);
    }
  };

  const simulateIncoming = async (phone: string, forceStop: boolean = false) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    setIsBotThinking(true);
    try {
      if (forceStop) {
        await handleSend("STOP", 'inbound');
        return;
      }

      const currentLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
      const threadLogs = currentLogs.filter((l: SMSLog) => l.phone === phone);
      const historyStr = threadLogs.slice(-3).map((l: SMSLog) => `${l.type}: ${l.message}`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Simulate a realistic and short customer SMS reply to this thread history:\n${historyStr}\n\nReturn only the text of the reply.`,
      });
      
      const messageText = response.text || "I'm interested, tell me more!";
      await handleSend(messageText, 'inbound');
    } catch (e) {
      console.error("Simulation Error:", e);
    } finally {
      setIsBotThinking(false);
    }
  };

  const smartReply = async () => {
    if (!selectedThread) return;
    setIsBotThinking(true);
    const threadLogs = logs.filter(l => l.phone === selectedThread);
    const contact = contacts.find(c => c.phone === selectedThread);
    const name = contact?.name || 'Customer';
    
    try {
      const aiResponse = await generateChatbotResponse(threadLogs, name);
      setReplyText(aiResponse);
    } catch (e) {
      console.error("Smart Reply Error:", e);
    } finally {
      setIsBotThinking(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] bg-[#0a0a0c] border border-zinc-800 rounded-3xl overflow-hidden flex shadow-2xl animate-in fade-in zoom-in duration-500">
      {/* Sidebar Threads */}
      <div className="w-80 border-r border-zinc-800 flex flex-col bg-[#0d0d0f]/50">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
           <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Active Nodes</h3>
           <div className="flex items-center gap-2">
              <div 
                onClick={() => setIsAiAgentActive(!isAiAgentActive)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer transition-all ${isAiAgentActive ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                title="AI Autopilot Mode"
              >
                <Zap size={10} className={isAiAgentActive ? 'fill-indigo-400' : ''} />
                <span className="text-[9px] font-black uppercase tracking-tighter">Autopilot</span>
              </div>
           </div>
        </div>
        <div className="p-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-indigo-500/50 transition-colors">
            <Search size={14} className="text-zinc-600" />
            <input type="text" placeholder="Filter conversations..." className="bg-transparent text-xs outline-none w-full text-zinc-300" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {threads.length === 0 ? (
            <div className="p-10 text-center space-y-3 opacity-30">
              <MessageSquare size={32} className="mx-auto text-zinc-600" />
              <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">No active decryptions</p>
            </div>
          ) : (
            threads.map(thread => (
              <div 
                key={thread.phone}
                onClick={() => setSelectedThread(thread.phone)}
                className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-all hover:bg-zinc-800/30 group ${selectedThread === thread.phone ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold flex items-center gap-2 ${selectedThread === thread.phone ? 'text-indigo-400' : 'text-zinc-200 group-hover:text-white'}`}>
                    {thread.name}
                    {!thread.active && <Ban size={10} className="text-red-500" />}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono tracking-tighter">
                    {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate font-medium">{thread.lastMessage}</p>
                <div className="mt-2 flex justify-between items-center">
                   {!thread.active && (
                     <span className="text-[8px] font-black uppercase text-red-500/60 tracking-[0.2em] px-1.5 py-0.5 border border-red-500/20 rounded-md">Opt-out</span>
                   )}
                   {thread.unread && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] ml-auto" />
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#050506]">
        {selectedThread ? (
          <>
            <div className="p-4 border-b border-zinc-800 bg-[#0d0d0f]/80 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black border transition-transform hover:scale-105 ${isInactive ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-indigo-600/20 border-indigo-500/20 text-indigo-400 shadow-inner'}`}>
                  {selectedThread.substring(selectedThread.length - 2)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    {selectedContact?.name || 'Direct Link'}
                    {isInactive && <span className="text-[8px] font-black uppercase bg-red-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20">Blocked</span>}
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{selectedThread}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={smartReply}
                  disabled={isBotThinking || isInactive}
                  className="text-[9px] font-black uppercase text-indigo-400 border border-indigo-500/30 px-3 py-2 rounded-xl hover:bg-indigo-500/10 transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                    <Sparkles size={12} /> Smart Reply
                 </button>
                 {!isInactive && (
                   <button 
                    onClick={() => simulateIncoming(selectedThread, true)}
                    className="text-[9px] font-black uppercase bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-2 rounded-xl transition-all flex items-center gap-2"
                   >
                      <AlertCircle size={12} /> Force STOP
                   </button>
                 )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-[url('https://grainy-gradients.vercel.app/noise.svg')] scroll-smooth custom-scrollbar">
              {isInactive && (
                <div className="mx-auto mb-4 bg-red-500/5 border border-red-500/10 p-5 rounded-[2rem] max-w-md flex items-start gap-4 animate-in slide-in-from-top-4 backdrop-blur-sm">
                   <Ban className="text-red-500 shrink-0 mt-1" size={18} />
                   <div>
                      <h5 className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-1">Opt-out Protocol Active</h5>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">This contact has utilized a global stop keyword. SaaS regulations prohibit manual or automated transmissions to this node.</p>
                   </div>
                </div>
              )}
              
              {currentMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`max-w-[75%] flex flex-col ${msg.type === 'outbound' ? 'ml-auto items-end' : 'mr-auto items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-xl flex flex-col gap-2 transition-all hover:scale-[1.01] ${
                    msg.type === 'outbound' 
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-indigo-500/10' 
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700/50 backdrop-blur-md'
                  }`}>
                    {msg.id.startsWith('bot-') && (
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase text-indigo-200 tracking-widest border-b border-indigo-400/20 pb-1.5 mb-1.5">
                        <Zap size={10} className="fill-indigo-300" /> AI Autopilot Response
                      </div>
                    )}
                    <span className="font-medium">{msg.message}</span>
                  </div>
                  <span className="text-[9px] text-zinc-600 mt-2 font-mono uppercase tracking-widest">
                    {msg.type === 'outbound' ? 'Sent' : 'Received'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isBotThinking && (
                <div className="mr-auto flex items-center gap-2.5 text-zinc-600 font-bold uppercase tracking-[0.2em] text-[9px] animate-pulse bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                   <Loader2 size={12} className="text-indigo-500 animate-spin" /> 
                   Gemini analyzing thread context...
                </div>
              )}
            </div>

            <div className="p-5 border-t border-zinc-800 bg-[#0d0d0f]/80 backdrop-blur-xl">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(replyText); }}
                className="relative group"
              >
                <input 
                  type="text"
                  disabled={isInactive}
                  placeholder={isInactive ? "Transmissions Terminated" : "Type secure message..."}
                  className={`w-full bg-[#111113] border border-zinc-800 rounded-2xl px-6 py-5 pr-36 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner placeholder:text-zinc-700 ${isInactive ? 'opacity-20 cursor-not-allowed italic' : 'group-hover:border-zinc-700'}`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   {!isInactive && (
                     <button 
                        type="submit" 
                        disabled={!replyText.trim() || credits <= 0}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                     >
                        <Send size={14} /> Transmit
                     </button>
                   )}
                </div>
              </form>
              <div className="mt-3 flex items-center justify-between px-2">
                 <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAiAgentActive ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-zinc-700'}`} />
                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                       AI Status: {isAiAgentActive ? 'Contextual Autopilot Active' : 'Manual Mode Only'}
                    </span>
                 </div>
                 <div className="flex items-center gap-1 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                    <Coins size={10} /> {credits} Credits Available
                 </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="relative">
               <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
               <div className="relative w-24 h-24 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                 <MessageSquare size={44} className="text-zinc-700" />
               </div>
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-400">Hub Entry Point</h3>
               <p className="text-zinc-600 max-w-sm text-sm font-medium leading-relaxed italic">Synchronizing with decrypted conversation nodes. Select a terminal on the left to begin transmission protocol.</p>
            </div>
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                  AES-256 Encrypted
               </div>
               <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                  Gemini Protocol v3.0
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
