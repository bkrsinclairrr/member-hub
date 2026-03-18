import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiox, AIOXEvent } from '@/lib/aiox';

export default function HistoryPage() {
  const [events, setEvents] = useState<AIOXEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const data = await aiox.getEvents(100);
      setEvents(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const uniqueAgents = [...new Set(events.map(e => e.agent))];

  const filtered = events.filter(e => {
    const matchSearch = e.type.toLowerCase().includes(search.toLowerCase()) ||
      e.agent.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchAgent = agentFilter === 'all' || e.agent === agentFilter;
    return matchSearch && matchStatus && matchAgent;
  });

  const statusBadge = (status: string) => {
    if (status === 'success') return 'bg-green-500/20 text-green-300 border border-green-500/30';
    if (status === 'error') return 'bg-red-500/20 text-red-300 border border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
  };

  const statusIcon = (status: string) => {
    if (status === 'success') return '✅';
    if (status === 'error') return '❌';
    return '⏳';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <History className="h-8 w-8 text-blue-400" /> Histórico
          </h1>
          <p className="text-gray-400 mt-1">Auditoria e histórico de eventos do AIOX Engine</p>
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
          <span>Engine offline ou inacessível. Configure a URL em <Link to="/settings" className="underline">Configurações</Link>.</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: events.length, color: 'text-white' },
          { label: 'Sucesso', value: events.filter(e => e.status === 'success').length, color: 'text-green-400' },
          { label: 'Erro', value: events.filter(e => e.status === 'error').length, color: 'text-red-400' },
          { label: 'Pendente', value: events.filter(e => e.status === 'pending').length, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar eventos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="success">Sucesso</option>
          <option value="error">Erro</option>
          <option value="pending">Pendente</option>
        </select>
        <select
          value={agentFilter}
          onChange={e => setAgentFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todos os Agentes</option>
          {uniqueAgents.map(agent => (
            <option key={agent} value={agent}>{agent}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Timeline de Eventos</h2>
        {loading && events.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Carregando eventos…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {error ? 'AIOX Engine não disponível' : 'Nenhum evento encontrado'}
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition"
              >
                <span className="text-xl shrink-0 mt-0.5">{statusIcon(event.status)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs bg-slate-700 px-2 py-0.5 rounded text-gray-300">{event.type}</span>
                    <span className="text-gray-500 text-xs">em</span>
                    <span className="text-white text-sm font-medium">{event.agent}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </p>
                  {event.data && Object.keys(event.data).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-400 text-xs">
                        Detalhes ({Object.keys(event.data).length} campos)
                      </summary>
                      <pre className="mt-2 bg-black/50 p-3 rounded-lg overflow-x-auto text-gray-400 text-xs">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge(event.status)}`}>
                  {event.status.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
