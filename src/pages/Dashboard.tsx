import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Bot, Users, Activity, Zap, TrendingUp, Clock, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { aiox, AIOXAgent, AIOXEvent } from '@/lib/aiox';
import { supabase } from '@/lib/supabase';

// AIOX Dashboard URL — update after deploying to Vercel
const AIOX_DASHBOARD_URL = import.meta.env.VITE_AIOX_DASHBOARD_URL || '';

export default function Dashboard() {
  const { user, session } = useAuth();
  const [agents, setAgents] = useState<AIOXAgent[]>([]);
  const [events, setEvents] = useState<AIOXEvent[]>([]);
  const [metrics, setMetrics] = useState<{ uptime?: number; totalExecutions?: number } | null>(null);
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      const [agentsRes, eventsRes, metricsRes] = await Promise.allSettled([
        aiox.getAgents(),
        aiox.getEvents(10),
        aiox.getMetrics(),
      ]);
      if (agentsRes.status === 'fulfilled') setAgents(agentsRes.value);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value);
      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
      setEngineOnline(agentsRes.status === 'fulfilled' || eventsRes.status === 'fulfilled');
      setLastUpdated(new Date());
    } catch {
      setEngineOnline(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5000);
    return () => clearInterval(id);
  }, []);

  const handleOpenAIOX = () => {
    if (!AIOX_DASHBOARD_URL) {
      alert('URL do AIOX Dashboard não configurada. Defina VITE_AIOX_DASHBOARD_URL no .env.local');
      return;
    }
    if (session?.access_token && session?.refresh_token) {
      const url = `${AIOX_DASHBOARD_URL}/#access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=bearer`;
      window.open(url, '_blank', 'noopener');
    } else {
      window.open(AIOX_DASHBOARD_URL, '_blank', 'noopener');
    }
  };

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const successRate = events.length > 0
    ? Math.round((events.filter(e => e.status === 'success').length / events.length) * 100)
    : null;

  const stats = [
    { label: 'Agentes Ativos', value: engineOnline === null ? '…' : `${activeAgents}/${agents.length}`, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Membros da Equipe', value: '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Eventos Recentes', value: engineOnline === null ? '…' : String(events.length), icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Taxa de Sucesso', value: successRate !== null ? `${successRate}%` : '—', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  const getStatusDot = (status: string) => {
    if (status === 'active') return 'bg-green-400';
    if (status === 'error') return 'bg-red-400';
    return 'bg-gray-500';
  };

  const getEventBadge = (status: string) => {
    if (status === 'success') return 'text-green-400 bg-green-400/10';
    if (status === 'error') return 'text-red-400 bg-red-400/10';
    return 'text-yellow-400 bg-yellow-400/10';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-slate-800 to-blue-900/30 border border-slate-700 rounded-2xl p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Olá, {user?.user_metadata?.name || user?.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-purple-300 text-sm">AIOX AI Orchestration Platform</p>
              </div>
            </div>
            <p className="text-gray-300 max-w-xl">
              Bem-vindo ao painel de controle. Gerencie seus agentes de IA, monitore execuções
              e controle o acesso da sua equipe.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              engineOnline === null ? 'bg-slate-700 text-gray-400' :
              engineOnline ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                engineOnline === null ? 'bg-gray-400' :
                engineOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
              {engineOnline === null ? 'Conectando…' : engineOnline ? 'Engine Online' : 'Engine Offline'}
            </div>
            {lastUpdated && (
              <button onClick={loadData} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition">
                <RefreshCw className="h-3 w-3" />
                {lastUpdated.toLocaleTimeString('pt-BR')}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* AIOX Dashboard CTA */}
      {AIOX_DASHBOARD_URL && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={handleOpenAIOX}
          className="w-full flex items-center justify-between bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-700/50 rounded-xl px-6 py-4 hover:border-green-600/60 transition group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div className="text-left">
              <p className="text-white font-semibold">Abrir AIOX Dashboard</p>
              <p className="text-green-300/70 text-xs">Acesse o painel completo com 22 views, Chat, Engine, World e mais</p>
            </div>
          </div>
          <ExternalLink className="h-5 w-5 text-green-400 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      )}

      {/* Engine offline banner */}
      {engineOnline === false && (
        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl px-5 py-4 text-yellow-300 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>AIOX Engine offline. Configure a URL em <Link to="/settings" className="underline">Configurações</Link> ou inicie o engine em <code className="bg-black/30 px-1 rounded">localhost:4002</code>.</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Agents + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-400" /> Agentes
            </h2>
            <Link to="/agents" className="text-xs text-purple-400 hover:text-purple-300 transition">Ver todos →</Link>
          </div>
          {agents.length === 0 ? (
            <p className="text-gray-500 text-sm">{engineOnline === false ? 'Engine offline' : engineOnline === null ? 'Carregando…' : 'Nenhum agente'}</p>
          ) : (
            <div className="space-y-3">
              {agents.slice(0, 5).map(agent => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(agent.status)}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{agent.name}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[180px]">{agent.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500/20 text-green-300' :
                    agent.status === 'error' ? 'bg-red-500/20 text-red-300' :
                    'bg-slate-700 text-gray-400'
                  }`}>{agent.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" /> Eventos Recentes
            </h2>
            <Link to="/history" className="text-xs text-blue-400 hover:text-blue-300 transition">Histórico →</Link>
          </div>
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">{engineOnline === false ? 'Engine offline' : engineOnline === null ? 'Carregando…' : 'Nenhum evento'}</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${getEventBadge(event.status)}`}>{event.type}</span>
                  <span className="text-gray-300 truncate flex-1">{event.agent}</span>
                  <span className="text-gray-500 text-xs whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-400" /> Acesso Rápido
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Agentes',      path: '/agents',   color: 'from-purple-600 to-blue-600', icon: '🤖' },
            { label: 'Histórico',    path: '/history',  color: 'from-blue-600 to-cyan-600',   icon: '📋' },
            { label: 'Equipe',       path: '/team',     color: 'from-cyan-600 to-teal-600',   icon: '👥' },
            { label: 'Configurações', path: '/settings', color: 'from-slate-600 to-slate-700', icon: '⚙️' },
          ].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 justify-center px-4 py-3 rounded-xl bg-gradient-to-r ${item.color} hover:opacity-90 transition text-white text-sm font-medium`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

