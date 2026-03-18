import { motion } from 'framer-motion';
import { Bot, Zap, Info } from 'lucide-react';

export default function AgentsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bot className="h-8 w-8 text-purple-400" /> Agentes IA
        </h1>
        <p className="text-gray-400 mt-1">Gerencie e monitore seus agentes de inteligência artificial</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-blue-500/30 rounded-xl p-6 flex items-start gap-4"
      >
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1">AIOX Engine necessário</h3>
          <p className="text-gray-400 text-sm">
            Para gerenciar agentes, o AIOX Engine precisa estar rodando localmente ou em um servidor.
            Por padrão ele conecta em <code className="text-purple-300 bg-slate-700 px-1 rounded">http://localhost:4002</code>.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Enquanto isso, você pode gerenciar sua <a href="/team" className="text-purple-400 hover:underline">Equipe</a> e configurações normalmente.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Agente de Análise', 'Agente de Relatórios', 'Agente de Suporte'].map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 opacity-50"
          >
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-white font-medium">{name}</h3>
            <p className="text-gray-500 text-xs mt-1">Offline — engine não conectado</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
