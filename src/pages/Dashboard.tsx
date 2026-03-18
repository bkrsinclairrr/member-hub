import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Bot, Users, Activity, Zap, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Agentes Ativos', value: '—', icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Membros da Equipe', value: '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Execuções Hoje', value: '—', icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Uptime', value: '99.9%', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

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
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
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
      </motion.div>

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

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" /> Atividade Recente
          </h2>
          <div className="space-y-3">
            {['Sistema iniciado', 'Supabase conectado', `Login como ${user?.email}`].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" /> Acesso Rápido
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Gerenciar Agentes',  path: '/agents',   color: 'from-purple-600 to-blue-600' },
              { label: 'Gerenciar Equipe',   path: '/team',     color: 'from-blue-600 to-cyan-600' },
              { label: 'Configurações',      path: '/settings', color: 'from-slate-600 to-slate-700' },
            ].map(item => (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r ${item.color} hover:opacity-90 transition text-white text-sm font-medium`}
              >
                {item.label}
                <span>→</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

