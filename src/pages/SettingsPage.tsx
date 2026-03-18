import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Settings, User, Bell, Shield, Save, Loader2, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { aiox } from '@/lib/aiox';

interface AIOXSettings {
  aiox_engine_url: string;
  auto_sync: boolean;
  notifications_enabled: boolean;
}

const DEFAULT_SETTINGS: AIOXSettings = {
  aiox_engine_url: '',
  auto_sync: true,
  notifications_enabled: true,
};

function loadSettings(): AIOXSettings {
  try {
    const raw = localStorage.getItem('aiox-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [aiSettings, setAiSettings] = useState<AIOXSettings>(loadSettings);
  const [engineStatus, setEngineStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  // Check engine health
  useEffect(() => {
    const check = async () => {
      setEngineStatus('checking');
      try {
        await aiox.getHealth();
        setEngineStatus('online');
      } catch {
        setEngineStatus('offline');
      }
    };
    check();
  }, [aiSettings.aiox_engine_url]);

  const handleSaveProfile = async (e: React.FormEvent) => {
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

  const handleSettingChange = (key: keyof AIOXSettings, value: unknown) => {
    const next = { ...aiSettings, [key]: value };
    setAiSettings(next);
    localStorage.setItem('aiox-settings', JSON.stringify(next));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwError('As senhas não coincidem.');
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) throw error;
      setPwSaved(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-purple-400" /> Configurações
        </h1>
        <p className="text-gray-400 mt-1">Gerencie sua conta e preferências do AIOX</p>
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
        <form onSubmit={handleSaveProfile} className="space-y-4">
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
          <div>
            <label className="block text-sm text-gray-400 mb-1">Conta criada em</label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleString('pt-BR') : ''}
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
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando…</>
              : saved
              ? <><Save className="h-4 w-4" /> Salvo! ✓</>
              : <><Save className="h-4 w-4" /> Salvar</>}
          </button>
        </form>
      </motion.div>

      {/* AIOX Engine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" /> AIOX Engine
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">URL do Engine</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiSettings.aiox_engine_url}
                onChange={e => handleSettingChange('aiox_engine_url', e.target.value)}
                placeholder="http://localhost:4002"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              />
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border ${
                engineStatus === 'online' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                engineStatus === 'offline' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                'bg-slate-700 text-gray-400 border-slate-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  engineStatus === 'online' ? 'bg-green-400 animate-pulse' :
                  engineStatus === 'offline' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
                {engineStatus === 'online' ? 'Online' : engineStatus === 'offline' ? 'Offline' : '…'}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Deixe em branco para usar o padrão (localhost:4002)</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aiSettings.auto_sync}
              onChange={e => handleSettingChange('auto_sync', e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
            <span className="text-sm text-white">Sincronização automática (polling 5s)</span>
          </label>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-400" /> Notificações
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={aiSettings.notifications_enabled}
            onChange={e => handleSettingChange('notifications_enabled', e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
          />
          <span className="text-sm text-white">Habilitar notificações no navegador</span>
        </label>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" /> Segurança
        </h2>
        <div className="flex items-center justify-between py-2 border-b border-slate-700 mb-4">
          <div>
            <p className="text-white text-sm">Sessão atual</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
          <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-1 rounded-full">Online</span>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <h3 className="text-white text-sm font-medium">Alterar senha</h3>
          {pwError && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {pwError}
            </div>
          )}
          <input
            type="password"
            placeholder="Senha nova"
            value={pwForm.next}
            onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar senha nova"
            value={pwForm.confirm}
            onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pwSaving || !pwForm.next}
            className="flex items-center gap-2 px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            {pwSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Alterando…</> :
             pwSaved ? '✓ Senha alterada!' : 'Alterar senha'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
