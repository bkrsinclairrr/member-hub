import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Search, Play, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiox, AIOXAgent } from '@/lib/aiox';

export default function AgentsPage() {
  const [agents, setAgents] = useState<AIOXAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [executing, setExecuting] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await aiox.getAgents();
      setAgents(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const filtered = agents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExecute = async (id: string) => {
    setExecuting(id);
    try {
      await aiox.executeAgent(id);
      await load();
    } catch (err: unknown) {
      alert('Erro ao executar agente: ' + (err instanceof Error ? err.message : err));
    } finally {
      setExecuting(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'active') return 'bg-green-500/20 text-green-300 border border-green-500/30';
    if (status === 'error') return 'bg-red-500/20 text-red-300 border border-red-500/30';
    return 'bg-slate-700 text-gray-400 border border-slate-600';
  };

  const statusDot = (status: string) => {
    if (status === 'active') return 'bg-green-400 animate-pulse';
    if (status === 'error') return 'bg-red-400';
    return 'bg-gray-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="h-8 w-8 text-purple-400" /> Agentes IA
          </h1>
          <p className="text-gray-400 mt-1">Gerencie e execute seus agentes de inteligência artificial</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-gray-400 hover:text-white hover:border-slate-600 transition text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl px-5 py-4 text-yellow-300 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Engine offline ou inacessível. Configure a URL em <Link to="/settings" className="underline">Configurações</Link>. Erro: {error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: agents.length, color: 'text-white' },
          { label: 'Ativos', value: agents.filter(a => a.status === 'active').length, color: 'text-green-400' },
          { label: 'Com Erro', value: agents.filter(a => a.status === 'error').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar agentes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="error">Com Erro</option>
        </select>
      </div>

      {/* Agents list */}
      <div className="space-y-3">
        {loading && agents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Carregando agentes…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {error ? 'AIOX Engine não disponível' : 'Nenhum agente encontrado'}
          </div>
        ) : (
          filtered.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative mt-0.5">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Bot className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${statusDot(agent.status)}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{agent.name}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{agent.description}</p>
                    {agent.lastRun && (
                      <p className="text-gray-600 text-xs mt-2">
                        Última execução: {new Date(agent.lastRun).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(agent.status)}`}>
                    {agent.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleExecute(agent.id)}
                    disabled={agent.status !== 'active' || executing === agent.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500 rounded-lg text-white text-xs font-medium transition"
                  >
                    <Play className="h-3 w-3" />
                    {executing === agent.id ? 'Executando…' : 'Executar'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
