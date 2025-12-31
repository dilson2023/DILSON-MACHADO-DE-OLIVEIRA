
import React from 'react';
import { Check, Shield, Zap, Crown, CreditCard, ArrowRight, Star } from 'lucide-react';
import { useApp } from '../App';

const Billing: React.FC = () => {
  const { t, lang } = useApp();
  
  const plans = [
    {
      name: 'Lite',
      price: '$29',
      features: lang === 'en' 
        ? ['1,000 Messages/mo', 'Basic Templates', 'Standard Gateway'] 
        : ['1.000 Mensagens/mês', 'Modelos Básicos', 'Gateway Padrão'],
      color: 'zinc',
      active: false
    },
    {
      name: 'Elite SaaS',
      price: '$149',
      features: lang === 'en'
        ? ['Unlimited IA Generation', 'Elite Gemini Integration', 'Dedicated SMS Cluster', 'API Webhooks']
        : ['Geração IA Ilimitada', 'Integração Gemini Elite', 'Cluster SMS Dedicado', 'Webhooks de API'],
      color: 'indigo',
      active: true,
      popular: true
    },
    {
      name: 'Agency',
      price: '$499',
      features: lang === 'en'
        ? ['White-label Console', 'Custom AI Training', 'Priority Routing', '24/7 Support']
        : ['Console White-label', 'Treino IA Customizado', 'Roteamento Prioritário', 'Suporte 24/7'],
      color: 'purple',
      active: false
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="text-center space-y-4 pt-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-4">
           <Star size={14} className="text-indigo-400 fill-indigo-400" />
           <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{lang === 'en' ? 'SaaS Premium Infrastructure' : 'Infraestrutura SaaS Premium'}</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-tight">Scale Your <span className="text-indigo-500">Reach</span></h2>
        <p className="text-zinc-500 max-w-xl mx-auto font-medium">{t('billing_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col group ${
              plan.active 
                ? 'bg-[#0a0a0c] border-indigo-500/50 shadow-[0_20px_50px_rgba(99,102,241,0.1)]' 
                : 'bg-[#0d0d0f]/50 border-zinc-800/50 hover:border-zinc-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-xl shadow-indigo-500/30">
                Top Tier Choice
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tighter text-white">{plan.price}</span>
                {plan.price !== 'Contact' && <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">/mo</span>}
              </div>
            </div>

            <ul className="flex-1 space-y-5 mb-12">
              {plan.features.map(feat => (
                <li key={feat} className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className={`p-1.5 rounded-full ${plan.active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-600'}`}>
                    <Check size={14} />
                  </div>
                  <span className="group-hover:text-zinc-200 transition-colors font-medium">{feat}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all ${
              plan.active 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-white'
            }`}>
              {plan.active ? (lang === 'en' ? 'Active Protocol' : 'Protocolo Ativo') : t('billing_upgrade')}
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0f]/80 border border-zinc-800/50 rounded-[3rem] p-10 max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20" />
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner">
            <Shield size={40} />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white mb-2 italic">Elite Data Sovereign</h4>
            <p className="text-sm text-zinc-500 font-medium">Messages are encrypted with military-grade AES-256 protocols before gateway transmission.</p>
          </div>
        </div>
        <div className="flex flex-col items-center lg:items-end gap-3">
           <div className="flex -space-x-4">
              {[1,2,3,4,5].map(i => (
                <img key={i} src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i + 20}`} className="w-12 h-12 rounded-full border-4 border-[#0d0d0f] bg-zinc-800 grayscale hover:grayscale-0 transition-all cursor-pointer" />
              ))}
           </div>
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Validated by 2k+ Growth Agencies</p>
        </div>
      </div>
    </div>
  );
};

export default Billing;
