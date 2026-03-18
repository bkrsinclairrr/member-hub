import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Play, X, RefreshCw, AlertTriangle, ChevronDown, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiox, AIOXJob, AIOXRegistry } from '@/lib/aiox';

type JobStatus = AIOXJob['status'];

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; icon: React.ReactNode }> = {
  queued:    { label: 'Na fila',    color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', icon: <Clock className="h-4 w-4" /> },
  running:   { label: 'Rodando',   color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',       icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  done:      { label: 'Concluído', color: 'text-green-400 border-green-500/30 bg-green-500/10',    icon: <CheckCircle className="h-4 w-4" /> },
  failed:    { label: 'Falhou',    color: 'text-red-400 border-red-500/30 bg-red-500/10',          icon: <XCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelado', color: 'text-gray-400 border-gray-600 bg-gray-500/10',          icon: <X className="h-4 w-4" /> },
};

export default function OrchestratorPage() {
  const [registry, setRegistry] = useState<AIOXRegistry | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  // Form
  const [task, setTask] = useState('');
  const [selectedSquad, setSelectedSquad] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [submitting, setSubmitting] = useState(false);

  // Active job
  const [activeJob, setActiveJob] = useState<AIOXJob | null>(null);
  const [jobLogs, setJobLogs] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recent jobs
  const [recentJobs, setRecentJobs] = useState<AIOXJob[]>([]);

  const loadRegistry = async () => {
    try {
      const data = await aiox.getRegistry();
      setRegistry(data);
      setEngineError(null);
    } catch (err: unknown) {
      setEngineError(err instanceof Error ? err.message : 'Engine offline');
    }
  };

  const loadRecentJobs = async () => {
    try {
      const jobs = await aiox.getJobs({ limit: 20 });
      setRecentJobs(jobs);
    } catch {}
  };

  useEffect(() => {
    loadRegistry();
    loadRecentJobs();
  }, []);

  // Agents filtered by selected squad
  const agentsForSquad = registry?.agents.filter(
    a => !selectedSquad || a.squadId === selectedSquad
  ) ?? [];

  // Poll active job
  const startPolling = (jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const job = await aiox.getJob(jobId);
        setActiveJob(job);
        try {
          const logs = await aiox.getJobLogs(jobId);
          setJobLogs(logs.logs ?? []);
        } catch {}
        if (job.status === 'done' || job.status === 'failed' || job.status === 'cancelled') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          loadRecentJobs();
        }
      } catch {}
    }, 2000);
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    setSubmitting(true);
    setActiveJob(null);
    setJobLogs([]);
    try {
      let result: { jobId?: string; id?: string; status: string };
      if (selectedAgent) {
        result = await aiox.execute({
          agentId: selectedAgent,
          squadId: selectedSquad || undefined,
          message: task,
        });
      } else {
        result = await aiox.orchestrate({
          task,
          squad: selectedSquad || undefined,
          priority,
        });
      }
      const jobId = result.jobId || result.id;
      if (jobId) {
        const initial: AIOXJob = {
          id: jobId,
          status: (result.status as JobStatus) || 'queued',
          message: task,
          createdAt: new Date().toISOString(),
          squadId: selectedSquad || undefined,
          agentId: selectedAgent || undefined,
        };
        setActiveJob(initial);
        startPolling(jobId);
      }
      setTask('');
    } catch (err: unknown) {
      alert('Erro ao executar: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!activeJob) return;
    try {
      await aiox.cancelJob(activeJob.id);
      setActiveJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    } catch (err: unknown) {
      alert('Erro ao cancelar: ' + (err instanceof Error ? err.message : err));
    }
  };

  const elapsed = activeJob?.startedAt
    ? Math.round((Date.now() - new Date(activeJob.startedAt).getTime()) / 1000)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Cpu className="h-8 w-8 text-purple-400" /> Orquestrador
        </h1>
        <p className="text-gray-400 mt-1">Execute tarefas em agentes e squads do AIOX Engine</p>
      </div>

      {/* Error */}
      {engineError && (
        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl px-5 py-4 text-yellow-300 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Engine offline — configure a URL em <Link to="/settings" className="underline">Configurações</Link> ou <span className="font-mono text-xs bg-black/30 px-1 rounded">localhost:4002</span>.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-400" /> Nova Tarefa
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Squad + Agent selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Squad <span className="text-gray-600">(opcional)</span></label>
                  <div className="relative">
                    <select
                      value={selectedSquad}
                      onChange={e => { setSelectedSquad(e.target.value); setSelectedAgent(''); }}
                      className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 pr-8"
                    >
                      <option value="">Todos os squads</option>
                      {(registry?.squads ?? []).map(s => (
                        <option key={s.id} value={s.id}>{s.name || s.id}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Agente <span className="text-gray-600">(opcional)</span></label>
                  <div className="relative">
                    <select
                      value={selectedAgent}
                      onChange={e => setSelectedAgent(e.target.value)}
                      className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 pr-8"
                    >
                      <option value="">Orquestrador decide</option>
                      {agentsForSquad.map(a => (
                        <option key={a.id} value={a.id}>{a.name || a.id}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Prioridade</label>
                <div className="flex gap-2">
                  {(['low', 'normal', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition border ${
                        priority === p
                          ? p === 'high' ? 'bg-red-500/20 border-red-500/50 text-red-300'
                            : p === 'normal' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-slate-600 border-slate-500 text-gray-300'
                          : 'bg-slate-700 border-slate-600 text-gray-500 hover:border-slate-500'
                      }`}
                    >
                      {p === 'low' ? 'Baixa' : p === 'normal' ? 'Normal' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task input */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Tarefa / Instrução</label>
                <textarea
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  rows={5}
                  placeholder="Descreva o que o agente deve fazer..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !task.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition"
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : <><Play className="h-4 w-4" /> Executar</>}
                </button>
                {activeJob && (activeJob.status === 'running' || activeJob.status === 'queued') && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2.5 bg-red-900/40 border border-red-700/50 hover:bg-red-900/60 text-red-300 rounded-lg text-sm transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Active job output */}
          <AnimatePresence>
            {activeJob && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Execução em andamento</h2>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[activeJob.status]?.color ?? ''}`}>
                    {STATUS_CONFIG[activeJob.status]?.icon}
                    {STATUS_CONFIG[activeJob.status]?.label ?? activeJob.status}
                    {elapsed !== null && activeJob.status === 'running' && ` (${elapsed}s)`}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">Job ID</p>
                      <p className="text-gray-300 font-mono truncate">{activeJob.id}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">Criado</p>
                      <p className="text-gray-300">{new Date(activeJob.createdAt).toLocaleTimeString('pt-BR')}</p>
                    </div>
                  </div>

                  {/* Output */}
                  {(activeJob.output || jobLogs.length > 0) && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Output</p>
                      <div className="bg-black/60 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-green-300 whitespace-pre-wrap">
                        {activeJob.output || jobLogs.join('\n')}
                      </div>
                    </div>
                  )}

                  {activeJob.error && (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-xs text-red-300 font-mono whitespace-pre-wrap">
                      {activeJob.error}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: recent jobs */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Jobs Recentes</h2>
            <button onClick={loadRecentJobs} className="text-gray-500 hover:text-gray-300 transition">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {recentJobs.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-4">Nenhum job ainda</p>
            ) : (
              recentJobs.map(job => {
                const cfg = STATUS_CONFIG[job.status];
                return (
                  <div key={job.id} className="bg-slate-900/50 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg?.color ?? ''}`}>
                        {cfg?.icon}
                        <span>{cfg?.label ?? job.status}</span>
                      </span>
                      <span className="text-gray-600 text-xs">{new Date(job.createdAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    {(job.agentId || job.squadId) && (
                      <p className="text-gray-500 text-xs truncate">{job.agentId || job.squadId}</p>
                    )}
                    {job.message && (
                      <p className="text-gray-400 text-xs truncate">{job.message}</p>
                    )}
                    {(job.status === 'failed' || (job.status === 'queued' || job.status === 'running')) && (
                      <div className="flex gap-1.5 pt-1">
                        {job.status === 'failed' && (
                          <button
                            onClick={() => aiox.retryJob(job.id).then(loadRecentJobs)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition"
                          >
                            ↻ Retry
                          </button>
                        )}
                        {(job.status === 'queued' || job.status === 'running') && (
                          <button
                            onClick={() => aiox.cancelJob(job.id).then(loadRecentJobs)}
                            className="text-xs text-red-400 hover:text-red-300 transition"
                          >
                            ✕ Cancelar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
