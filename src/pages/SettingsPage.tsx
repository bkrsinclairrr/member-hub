import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Settings, User, Bell, Shield, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { name } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-purple-400" /> Configurações
        </h1>
        <p className="text-gray-400 mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" /> Perfil
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-700 rounded-lg text-gray-400 text-sm cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
              : saved
              ? <><Save className="h-4 w-4" /> Salvo!</>
              : <><Save className="h-4 w-4" /> Salvar</>}
          </button>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" /> Segurança
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-700">
            <div>
              <p className="text-white text-sm">Autenticação</p>
              <p className="text-gray-400 text-xs">Supabase Auth — email/senha</p>
            </div>
            <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-1 rounded-full">Ativo</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm">Sessão atual</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
            <span className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2 py-1 rounded-full">Online</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
