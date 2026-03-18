import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Clock, RefreshCw, AlertTriangle, Play, X, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiox, AIOXHealth, AIOXPool, AIOXJob, AIOXCron } from '@/lib/aiox';

const JOB_STATUS_COLOR: Record<string, string> = {
  queued:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  running:   'bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse',
  done:      'bg-green-500/20 text-green-300 border-green-500/30',
  failed:    'bg-red-500/20 text-red-300 border-red-500/30',
  cancelled: 'bg-slate-600 text-gray-400 border-slate-500',
};

export default function MonitorPage() {
  const [health, setHealth] = useState<AIOXHealth | null>(null);
  const [pool, setPool] = useState<AIOXPool | null>(null);
  const [jobs, setJobs] = useState<AIOXJob[]>([]);
  const [crons, setCrons] = useState<AIOXCron[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [newPoolSize, setNewPoolSize] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [h, p, j, c] = await Promise.allSettled([
        aiox.getHealth(),
        aiox.getPool(),
        aiox.getJobs({ limit: 50 }),
        aiox.getCrons(),
      ]);
      if (h.status === 'fulfilled') setHealth(h.value);
      if (p.status === 'fulfilled') setPool(p.value);
      if (j.status === 'fulfilled') setJobs(j.value);
      if (c.status === 'fulfilled') setCrons(c.value);
      setError(h.status === 'rejected' ? (h.reason instanceof Error ? h.reason.message : 'offline') : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const filteredJobs = jobFilter === 'all' ? jobs : jobs.filter(j => j.status === jobFilter);

  const handleResizePool = async () => {
    const n = parseInt(newPoolSize);
    if (!n || n < 1 || n > 20) return alert('Tamanho deve ser entre 1 e 20');
    try {
      await aiox.resizePool(n);
      setNewPoolSize('');
      await load();
    } catch (err: unknown) {
      alert('Erro: ' + (err instanceof Error ? err.message : err));
    }
  };

  const handleToggleCron = async (id: string, enabled: boolean) => {
    try {
      await aiox.toggleCron(id, !enabled);
      await load();
    } catch (err: unknown) {
      alert('Erro: ' + (err instanceof Error ? err.message : err));
    }
  };

  const uptimeFormatted = health?.uptime
    ? (() => {
        const s = Math.round(health.uptime);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
      })()
    : null;

  const JOB_TABS = [
    { key: 'all',       label: `Todos (${jobs.length})` },
    { key: 'running',   label: `Rodando (${jobs.filter(j => j.status === 'running').length})` },
    { key: 'queued',    label: `Na fila (${jobs.filter(j => j.status === 'queued').length})` },
    { key: 'done',      label: `Feitos (${jobs.filter(j => j.status === 'done').length})` },
    { key: 'failed',    label: `Falhos (${jobs.filter(j => j.status === 'failed').length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-400" /> Monitor do Engine
          </h1>
          <p className="text-gray-400 mt-1">Saúde, pool de processos, jobs e cron do AIOX Engine</p>
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
          <span>Engine offline — configure em <Link to="/settings" className="underline">Configurações</Link>.</span>
        </div>
      )}

      {/* Health + Pool stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Status', icon: Activity,
            value: health ? health.status : '—',
            color: health?.status === 'ok' || health?.status === 'healthy' ? 'text-green-400' : 'text-red-400',
            bg: 'bg-green-400/10',
          },
          {
            label: 'Uptime', icon: Clock,
            value: uptimeFormatted ?? '—',
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
          },
          {
            label: 'Processos', icon: Cpu,
            value: pool ? `${pool.running}/${pool.maxConcurrent}` : '—',
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
          {
            label: 'Na Fila', icon: RefreshCw,
            value: pool ? String(pool.queued) : '—',
            color: pool && pool.queued > 0 ? 'text-yellow-400' : 'text-gray-400',
            bg: 'bg-yellow-400/10',
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5"
            >
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Pool management */}
      {pool && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" /> Pool de Processos
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              {/* Utilization bar */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Utilização</span>
                <span className="text-xs text-gray-300">{pool.running}/{pool.maxConcurrent}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${pool.maxConcurrent > 0 ? (pool.running / pool.maxConcurrent) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                max={20}
                value={newPoolSize}
                onChange={e => setNewPoolSize(e.target.value)}
                placeholder={String(pool.maxConcurrent)}
                className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm text-center focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleResizePool}
                disabled={!newPoolSize}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition"
              >
                Redimensionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" /> Jobs
        </h2>
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-slate-900/50 p-1 rounded-lg w-fit">
          {JOB_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setJobFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                jobFilter === tab.key ? 'bg-slate-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredJobs.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">{error ? 'Engine offline' : 'Nenhum job encontrado'}</p>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${JOB_STATUS_COLOR[job.status] ?? ''}`}>
                  {job.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm truncate">{job.message || job.agentId || job.id}</p>
                  <p className="text-gray-600 text-xs">{job.squadId} • {new Date(job.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {job.status === 'failed' && (
                    <button onClick={() => aiox.retryJob(job.id).then(load)} className="p-1 text-blue-400 hover:text-blue-300 transition" title="Retry">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {(job.status === 'queued' || job.status === 'running') && (
                    <button onClick={() => aiox.cancelJob(job.id).then(load)} className="p-1 text-red-400 hover:text-red-300 transition" title="Cancelar">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cron jobs */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-400" /> Cron Jobs
        </h2>
        {crons.length === 0 ? (
          <p className="text-gray-500 text-sm">{error ? 'Engine offline' : 'Nenhum cron configurado'}</p>
        ) : (
          <div className="space-y-2">
            {crons.map(cron => (
              <div key={cron.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <button onClick={() => handleToggleCron(cron.id, cron.enabled)} className="shrink-0 transition">
                  {cron.enabled
                    ? <ToggleRight className="h-5 w-5 text-green-400" />
                    : <ToggleLeft className="h-5 w-5 text-gray-600" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{cron.agentId}</span>
                    {cron.squadId && <span className="text-gray-500 text-xs">({cron.squadId})</span>}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    <span className="font-mono bg-slate-700 px-1.5 py-0.5 rounded">{cron.schedule}</span>
                    {cron.description && ` — ${cron.description}`}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-600 shrink-0">
                  {cron.lastRun && <p>Último: {new Date(cron.lastRun).toLocaleString('pt-BR')}</p>}
                  {cron.nextRun && <p>Próximo: {new Date(cron.nextRun).toLocaleString('pt-BR')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
