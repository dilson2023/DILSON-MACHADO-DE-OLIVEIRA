
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  History, 
  Settings, 
  Zap, 
  Search,
  MessageSquare,
  CreditCard,
  Menu,
  X,
  Activity,
  Server,
  Coins,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Contact, SMSLog } from './types';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Campaign from './components/Campaign';
import Logs from './components/Logs';
import Inbox from './components/Inbox';
import Billing from './components/Billing';
import Infrastructure from './components/Infrastructure';
import SettingsPage from './components/SettingsPage';
import { onBackendLog, API } from './services/api';
import { translations, Language } from './translations';

const AppContext = createContext<{ 
  lang: Language, 
  setLang: (l: Language) => void, 
  t: (key: keyof typeof translations['en']) => string,
  credits: number,
  setCredits: React.Dispatch<React.SetStateAction<number>>,
  isOnline: boolean,
  updateContact: (id: string, updates: Partial<Contact>) => void,
  contacts: Contact[]
}>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  credits: 0,
  setCredits: () => {},
  isOnline: false,
  updateContact: () => {},
  contacts: []
});

export const useApp = () => useContext(AppContext);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('sms_lang') as Language) || 'en');
  const [credits, setCredits] = useState<number>(() => Number(localStorage.getItem('sms_credits')) || 5000);
  const [isOnline, setIsOnline] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('sms_contacts');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Dilson Tech', phone: '55999999999', active: true, createdAt: Date.now() },
      { id: '2', name: 'Maria Silva', phone: '55888888888', active: true, createdAt: Date.now() },
    ];
  });

  const [logs, setLogs] = useState<SMSLog[]>(() => {
    const saved = localStorage.getItem('sms_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key;

  useEffect(() => {
    const checkStatus = async () => {
      const status = await API.checkHealth();
      setIsOnline(status);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('sms_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sms_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    onBackendLog((newLog) => {
      setLogs(prev => {
        const updated = [newLog, ...prev];
        localStorage.setItem('sms_logs', JSON.stringify(updated));
        return updated;
      });
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('sms_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addLog = (log: SMSLog) => setLogs(prev => [log, ...prev]);

  return (
    <AppContext.Provider value={{ lang, setLang, t, credits, setCredits, isOnline, updateContact, contacts }}>
      <HashRouter>
        <div className="flex h-screen bg-[#050506] text-zinc-100 overflow-hidden font-sans">
          {/* Sidebar */}
          <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0a0c] border-r border-zinc-800 transition-all duration-300 flex flex-col z-50`}>
            <div className="p-6 flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                <Zap size={24} className="text-white" />
              </div>
              {isSidebarOpen && <h1 className="font-bold text-xl tracking-tighter text-white uppercase italic">SMS<span className="text-indigo-500">Elite</span></h1>}
            </div>

            <nav className="flex-1 px-3 space-y-1">
              <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label={t('nav_dashboard')} collapsed={!isSidebarOpen} />
              <SidebarLink to="/infrastructure" icon={<Server size={20} />} label={t('nav_infra')} collapsed={!isSidebarOpen} />
              <SidebarLink to="/contacts" icon={<Users size={20} />} label={t('nav_contacts')} collapsed={!isSidebarOpen} />
              <SidebarLink to="/campaign" icon={<Send size={20} />} label={t('nav_campaign')} collapsed={!isSidebarOpen} />
              <SidebarLink to="/inbox" icon={<MessageSquare size={20} />} label={t('nav_inbox')} collapsed={!isSidebarOpen} />
              <SidebarLink to="/logs" icon={<History size={20} />} label={t('nav_logs')} collapsed={!isSidebarOpen} />
            </nav>

            <div className="p-4 border-t border-zinc-800/50 space-y-1 bg-[#0d0d0f]/50">
               <SidebarLink to="/billing" icon={<CreditCard size={20} />} label={t('nav_billing')} collapsed={!isSidebarOpen} />
               <SidebarLink to="/settings" icon={<Settings size={20} />} label={t('nav_settings')} collapsed={!isSidebarOpen} />
               <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="flex items-center gap-3 px-3 py-2 w-full text-zinc-600 hover:text-white hover:bg-zinc-800/50 rounded-md transition-all mt-2"
               >
                  {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                  {isSidebarOpen && <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Terminal UI</span>}
               </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            <header className="h-16 border-b border-zinc-800 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 sticky top-0">
              <div className="flex items-center bg-zinc-900/40 border border-zinc-800/50 rounded-full px-4 py-1.5 w-80">
                <Search size={14} className="text-zinc-600 mr-2" />
                <input 
                  type="text" 
                  placeholder={t('header_search')} 
                  className="bg-transparent border-none outline-none text-xs w-full text-zinc-400 focus:text-white"
                />
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="hidden md:flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full hover:bg-indigo-500/20 transition-all cursor-help group">
                    <Coins size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase text-indigo-500 leading-none mb-0.5">{t('header_credits')}</span>
                       <span className="text-xs font-mono font-bold text-white leading-none">{credits.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="flex items-center bg-zinc-900/60 rounded-lg p-1 border border-zinc-800">
                    <button onClick={() => setLang('en')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>EN</button>
                    <button onClick={() => setLang('pt')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${lang === 'pt' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>PT</button>
                 </div>

                 <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-tighter">{t('header_backend')}</span>
                      <span className={`text-[10px] flex items-center gap-1 font-mono uppercase font-bold ${isOnline ? 'text-indigo-400' : 'text-red-500 animate-pulse'}`}>
                        {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                        {isOnline ? t('header_sync') : 'OFFLINE (3001)'}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-indigo-500 animate-pulse' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                 </div>

                 <div className="h-8 w-[1px] bg-zinc-800" />
                 <img src="https://api.dicebear.com/7.x/shapes/svg?seed=elite-admin" className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-indigo-500 transition-colors cursor-pointer" alt="User"/>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
              <div className="p-8 max-w-7xl mx-auto h-full">
                <Routes>
                  <Route path="/" element={<Dashboard contacts={contacts} logs={logs} />} />
                  <Route path="/infrastructure" element={<Infrastructure />} />
                  <Route path="/contacts" element={<Contacts contacts={contacts} setContacts={setContacts} />} />
                  <Route path="/campaign" element={<Campaign contacts={contacts} addLog={addLog} />} />
                  <Route path="/inbox" element={<Inbox logs={logs} setLogs={setLogs} contacts={contacts} />} />
                  <Route path="/logs" element={<Logs logs={logs} />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, collapsed: boolean }> = ({ to, icon, label, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
        isActive ? 'bg-indigo-500/10 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30'
      }`}
    >
      <span className={`${isActive ? 'text-indigo-400' : 'group-hover:text-zinc-300'}`}>{icon}</span>
      {!collapsed && <span className="text-sm tracking-tight">{label}</span>}
      {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
    </Link>
  );
};

export default App;
