import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Users, Settings, LogOut,
  Bot, ChevronLeft, ChevronRight, Menu, History,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agents',    label: 'Agentes',   icon: Bot },
  { path: '/history',   label: 'Histórico', icon: History },
  { path: '/team',      label: 'Equipe',    icon: Users },
  { path: '/settings',  label: 'Config.',   icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        mobile ? 'w-64' : collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-800 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">⚡</span>
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="text-white font-bold text-lg leading-none">AIOX</p>
            <p className="text-purple-300 text-xs">AI Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              } ${collapsed && !mobile ? 'justify-center' : ''}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(!collapsed || mobile) && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className={`p-3 border-t border-slate-800 space-y-2`}>
        {(!collapsed || mobile) && (
          <div className="px-3 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.user_metadata?.name || 'Usuário'}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm">Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex relative">
        <Sidebar />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <span className="text-white font-bold">AIOX</span>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
