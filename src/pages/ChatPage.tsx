import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, RefreshCw, AlertTriangle, ChevronDown, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiox, AIOXRegistry, AIOXJob } from '@/lib/aiox';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId?: string;
  timestamp: Date;
  status?: 'sending' | 'waiting' | 'done' | 'error';
  jobId?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [registry, setRegistry] = useState<AIOXRegistry | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedSquad, setSelectedSquad] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadRegistry = async () => {
    try {
      const data = await aiox.getRegistry();
      setRegistry(data);
      setEngineError(null);
    } catch (err: unknown) {
      setEngineError(err instanceof Error ? err.message : 'Engine offline');
    }
  };

  useEffect(() => {
    loadRegistry();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const agentsForSquad = (registry?.agents ?? []).filter(
    a => !selectedSquad || a.squadId === selectedSquad
  );

  const pollJob = (jobId: string, msgId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const job: AIOXJob = await aiox.getJob(jobId);
        if (job.status === 'done' || job.status === 'failed' || job.status === 'cancelled') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setMessages(prev => prev.map(m =>
            m.id === msgId
              ? {
                  ...m,
                  content: job.output || job.error || (job.status === 'cancelled' ? 'Cancelado.' : 'Sem resposta.'),
                  status: job.status === 'done' ? 'done' : 'error',
                }
              : m
          ));
          setSending(false);
        } else {
          // Update "waiting" status
          setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, status: 'waiting' } : m
          ));
        }
      } catch {}
    }, 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsgId = crypto.randomUUID();
    const assistMsgId = crypto.randomUUID();

    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    const waitMsg: Message = {
      id: assistMsgId,
      role: 'assistant',
      content: '',
      agentId: selectedAgent,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMsg, waitMsg]);
    setInput('');
    setSending(true);

    try {
      const result = await aiox.execute({
        agentId: selectedAgent,
        squadId: selectedSquad || undefined,
        message: input.trim(),
      });
      const jobId = result.jobId || result.id;
      if (!jobId) throw new Error('Sem jobId na resposta');
      setMessages(prev => prev.map(m => m.id === assistMsgId ? { ...m, jobId, status: 'waiting' } : m));
      pollJob(jobId, assistMsgId);
    } catch (err: unknown) {
      setMessages(prev => prev.map(m =>
        m.id === assistMsgId
          ? { ...m, content: 'Erro: ' + (err instanceof Error ? err.message : err), status: 'error' }
          : m
      ));
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setMessages([]);
    setSending(false);
  };

  const selectedAgentInfo = registry?.agents.find(a => a.id === selectedAgent);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-400" /> Chat com Agente
          </h1>
          <p className="text-gray-400 mt-1">Converse diretamente com agentes do AIOX Engine</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition">
            <X className="h-3.5 w-3.5" /> Limpar
          </button>
        )}
      </div>

      {/* Error */}
      {engineError && (
        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl px-5 py-3 text-yellow-300 text-sm mb-4 shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Engine offline — configure em <Link to="/settings" className="underline">Configurações</Link>.</span>
        </div>
      )}

      {/* Agent selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Squad</label>
            <div className="relative">
              <select
                value={selectedSquad}
                onChange={e => { setSelectedSquad(e.target.value); setSelectedAgent(''); }}
                className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 pr-8"
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
            <label className="block text-xs text-gray-400 mb-1.5">Agente <span className="text-red-400">*</span></label>
            <div className="relative">
              <select
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 pr-8"
              >
                <option value="">Selecione um agente</option>
                {agentsForSquad.map(a => (
                  <option key={a.id} value={a.id}>{a.name || a.id}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
        {selectedAgentInfo && (
          <p className="text-gray-500 text-xs mt-2 truncate">{selectedAgentInfo.description}</p>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-3">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-blue-400/50" />
            </div>
            <div>
              <p className="font-medium text-gray-400">Nenhuma mensagem ainda</p>
              <p className="text-sm mt-1">Selecione um agente e comece a conversar</p>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Bot className="h-3 w-3 text-purple-400" />
                        </div>
                        <span className="text-xs text-gray-500">{msg.agentId || 'Agente'}</span>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="flex items-center justify-end gap-1.5 mb-1.5">
                        <span className="text-xs text-gray-500">{user?.user_metadata?.name || 'Você'}</span>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
                        </div>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                        : msg.status === 'error'
                        ? 'bg-red-900/30 border border-red-700/50 text-red-300'
                        : 'bg-slate-700 text-gray-200'
                    }`}>
                      {msg.status === 'sending' || msg.status === 'waiting' ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">{msg.status === 'sending' ? 'Enviando…' : 'Aguardando resposta…'}</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || !selectedAgent}
            rows={2}
            placeholder={selectedAgent ? 'Digite sua mensagem… (Enter para enviar, Shift+Enter para nova linha)' : 'Selecione um agente para começar'}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim() || !selectedAgent}
            className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shrink-0"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
