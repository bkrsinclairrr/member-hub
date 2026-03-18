import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Users, UserPlus, Shield, Trash2, Mail, Crown,
  Eye, Lock, CheckCircle, AlertCircle, Loader2,
  UserCheck, UserX, Clock, Search, RefreshCw,
} from 'lucide-react';

type Role = 'owner' | 'admin' | 'member' | 'viewer';
type Status = 'active' | 'pending' | 'suspended';

interface TeamMember {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: Role;
  status: Status;
  joined_at: string;
  invited_by: string | null;
}

const ROLE_CONFIG: Record<Role, { label: string; color: string; icon: any; permissions: string[] }> = {
  owner: {
    label: 'Dono',
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    icon: Crown,
    permissions: ['Acesso total', 'Gerenciar membros', 'Configurações', 'Faturamento'],
  },
  admin: {
    label: 'Admin',
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    icon: Shield,
    permissions: ['Gerenciar agentes', 'Gerenciar membros', 'Ver histórico'],
  },
  member: {
    label: 'Membro',
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    icon: UserCheck,
    permissions: ['Criar e usar agentes', 'Ver histórico próprio'],
  },
  viewer: {
    label: 'Visualizador',
    color: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
    icon: Eye,
    permissions: ['Apenas visualização', 'Sem edição'],
  },
};

function StatusBadge({ status }: { status: Status }) {
  const config = {
    active:    { label: 'Ativo',    color: 'text-green-400 bg-green-400/10 border-green-400/30' },
    pending:   { label: 'Pendente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
    suspended: { label: 'Suspenso', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  };
  const c = config[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.color}`}>
      {c.label}
    </span>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<Role>('member');
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [inviting, setInviting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleModal, setShowRoleModal] = useState<TeamMember | null>(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    await loadMembers(user);
  };

  const loadMembers = async (user: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('joined_at', { ascending: false });
      if (error) throw error;
      const list: TeamMember[] = data || [];
      setMembers(list);
      const me = list.find(m => m.user_id === user?.id || m.email === user?.email);
      if (me) setCurrentUserRole(me.role);
      else if (list.length === 0) setCurrentUserRole('owner');
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const { error } = await supabase.from('team_members').insert({
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        status: 'pending',
        invited_by: currentUser?.email,
        joined_at: new Date().toISOString(),
      });
      if (error) throw error;
      showFeedback('success', `Convite registrado para ${inviteEmail}!`);
      setInviteEmail('');
      await loadMembers(currentUser);
    } catch (err: any) {
      showFeedback('error', err.message || 'Erro ao convidar membro');
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: Role) => {
    try {
      const { error } = await supabase
        .from('team_members').update({ role: newRole }).eq('id', memberId);
      if (error) throw error;
      showFeedback('success', 'Permissão atualizada!');
      setShowRoleModal(null);
      await loadMembers(currentUser);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleToggleSuspend = async (member: TeamMember) => {
    const newStatus: Status = member.status === 'suspended' ? 'active' : 'suspended';
    try {
      const { error } = await supabase
        .from('team_members').update({ status: newStatus }).eq('id', member.id);
      if (error) throw error;
      showFeedback('success', newStatus === 'suspended' ? 'Membro suspenso.' : 'Membro reativado.');
      await loadMembers(currentUser);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleRemove = async (member: TeamMember) => {
    if (!window.confirm(`Remover ${member.email}?`)) return;
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', member.id);
      if (error) throw error;
      showFeedback('success', 'Membro removido.');
      await loadMembers(currentUser);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';
  const filtered = members.filter(m =>
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-400" /> Equipe
          </h1>
          <p className="text-gray-400 mt-1">Gerencie seus funcionários e colaboradores</p>
        </div>
        <button
          onClick={() => loadMembers(currentUser)}
          className="p-2 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Role change modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-white font-semibold mb-4">Alterar permissão de {showRoleModal.email}</h3>
            <div className="space-y-2 mb-6">
              {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][])
                .filter(([r]) => r !== 'owner')
                .map(([role, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={role}
                      onClick={() => handleChangeRole(showRoleModal.id, role)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                        showRoleModal.role === role
                          ? cfg.color + ' border-current'
                          : 'border-slate-700 text-gray-400 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{cfg.label}</span>
                    </button>
                  );
                })}
            </div>
            <button
              onClick={() => setShowRoleModal(null)}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Cancelar
            </button>
          </motion.div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}
        >
          {feedback.type === 'success'
            ? <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
            : <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />}
          <span className="text-sm">{feedback.msg}</span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, cfg]) => {
          const Icon = cfg.icon;
          const count = members.filter(m => m.role === role).length;
          return (
            <div key={role} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${cfg.color.split(' ')[0]}`} />
                <span className="text-2xl font-bold text-white">{count}</span>
              </div>
              <p className="text-gray-400 text-sm">{cfg.label}s</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: invite + roles legend */}
        <div className="space-y-6">
          {canManage && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-400" /> Convidar Membro
              </h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      placeholder="colaborador@empresa.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Permissão</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  >
                    {currentUserRole === 'owner' && <option value="admin">Admin</option>}
                    <option value="member">Membro</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {inviting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Convidando...</>
                    : <><UserPlus className="h-4 w-4" /> Enviar Convite</>}
                </button>
              </form>
            </div>
          )}

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-400" /> Níveis de Acesso
            </h2>
            <div className="space-y-4">
              {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={role}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${cfg.color.split(' ')[0]}`} />
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <ul className="space-y-0.5 ml-6">
                      {cfg.permissions.map(p => (
                        <li key={p} className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-600 rounded-full" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: members list */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Membros ({members.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none w-40"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum membro encontrado</p>
                {canManage && <p className="text-xs mt-1 text-gray-500">Convide alguém pelo formulário ao lado</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(member => {
                  const cfg = ROLE_CONFIG[member.role];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl border border-slate-700 hover:border-slate-600 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(member.name || member.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-white text-sm font-medium truncate">{member.name || member.email}</p>
                        {member.name && <p className="text-gray-400 text-xs truncate">{member.email}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${cfg.color}`}>
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </span>
                        <StatusBadge status={member.status} />
                      </div>
                      {canManage && member.role !== 'owner' && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => setShowRoleModal(member)}
                            title="Alterar permissão"
                            className="p-1.5 hover:bg-slate-600 rounded-lg text-purple-400 hover:text-purple-300 transition"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(member)}
                            title={member.status === 'suspended' ? 'Reativar' : 'Suspender'}
                            className="p-1.5 hover:bg-slate-600 rounded-lg text-yellow-400 hover:text-yellow-300 transition"
                          >
                            {member.status === 'suspended'
                              ? <UserCheck className="h-4 w-4" />
                              : <UserX className="h-4 w-4" />}
                          </button>
                          {currentUserRole === 'owner' && (
                            <button
                              onClick={() => handleRemove(member)}
                              title="Remover"
                              className="p-1.5 hover:bg-slate-600 rounded-lg text-red-400 hover:text-red-300 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
