import React, { useState, useEffect, useCallback } from 'react';
import type { ArrestWarrant, Page, SystemLog, WarrantStatus } from './types';
import { formatTimestamp, generateId } from './utils';
import DashboardPage from './pages/DashboardPage';
import IndividualsPage from './pages/IndividualsPage';
import VehiclesPage from './pages/VehiclesPage';
import WarrantsPage from './pages/WarrantsPage';
import SeizuresPage from './pages/SeizuresPage';
import AssetsPage from './pages/AssetsPage';
import MonitoringPage from './pages/MonitoringPage';
import LogsPage from './pages/LogsPage';

/* ─────────────────── Sidebar ─────────────────── */

interface NavItem {
  key: Page;
  icon: string;
  label: string;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: '🏠', label: 'DASHBOARD' },
  { key: 'individuals', icon: '👤', label: 'INDIVÍDUOS' },
  { key: 'vehicles', icon: '🚔', label: 'VEÍCULOS' },
  { key: 'warrants', icon: '⚖️', label: 'MANDADOS', highlight: true },
  { key: 'seizures', icon: '📦', label: 'APREENSÕES' },
  { key: 'assets', icon: '📁', label: 'BENS' },
  { key: 'monitoring', icon: '📡', label: 'MONITORAMENTO' },
  { key: 'logs', icon: '📜', label: 'LOGS' },
];

const Sidebar: React.FC<{
  currentPage: Page;
  onNavigate: (page: Page) => void;
  logCount: number;
}> = ({ currentPage, onNavigate, logCount }) => (
  <div
    style={{
      width: 200,
      minWidth: 200,
      background: '#0d1f3c',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
      zIndex: 100,
    }}
  >
    {/* Logo */}
    <div
      style={{
        padding: '16px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 4 }}>⚖️</div>
      <div
        style={{
          color: '#c8a730',
          fontWeight: 900,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        PCSP
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 9,
          letterSpacing: 1,
          marginTop: 2,
          textTransform: 'uppercase',
        }}
      >
        Delegacia Digital
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 8,
          marginTop: 4,
          fontFamily: 'monospace',
        }}
      >
        v3.4.1 — SISP
      </div>
    </div>

    {/* Nav items */}
    <nav style={{ flex: 1, paddingTop: 8 }}>
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: isActive
                ? 'rgba(255,255,255,0.15)'
                : item.highlight
                ? 'rgba(200,167,48,0.08)'
                : 'transparent',
              border: 'none',
              borderLeft: item.highlight
                ? `3px solid ${isActive ? '#c8a730' : 'rgba(200,167,48,0.4)'}`
                : `3px solid ${isActive ? '#fff' : 'transparent'}`,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
              color: '#fff',
              marginBottom: 2,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(255,255,255,0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = item.highlight
                  ? 'rgba(200,167,48,0.08)'
                  : 'transparent';
              }
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: item.highlight ? 800 : isActive ? 700 : 400,
                letterSpacing: item.highlight ? 1 : 0.5,
                color: item.highlight ? '#c8a730' : isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                flex: 1,
              }}
            >
              {item.label}
            </span>
            {item.key === 'logs' && logCount > 0 && (
              <span
                style={{
                  background: '#8b0000',
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  minWidth: 16,
                  textAlign: 'center',
                }}
              >
                {logCount > 99 ? '99+' : logCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    {/* Footer */}
    <div
      style={{
        padding: '12px 14px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: 9,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'monospace',
      }}
    >
      <div>🔒 SESSÃO REGISTRADA</div>
      <div style={{ marginTop: 3 }}>Sgt. Junior S.</div>
    </div>
  </div>
);

/* ─────────────────── Status Bar ─────────────────── */
const StatusBar: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: '#1a3a6b',
        borderBottom: '2px solid #c8a730',
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        fontSize: 10,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      <span style={{ fontWeight: 700, color: '#c8a730', letterSpacing: 1, marginRight: 20 }}>
        POLÍCIA CIVIL DO ESTADO DE SÃO PAULO — SISTEMA INTEGRADO OPERACIONAL
      </span>
      <div style={{ display: 'flex', gap: 20, marginLeft: 'auto', alignItems: 'center' }}>
        <span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>ACESSO: </span>
          <span style={{ color: '#c8a730', fontWeight: 700 }}>OPERACIONAL</span>
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ color: '#4caf50', fontSize: 9 }}>●</span>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>MONITORAMENTO ATIVO</span>
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>SESSÃO REGISTRADA</span>
        <span style={{ color: '#fff', fontWeight: 700 }}>Sgt. Junior S.</span>
        <span
          style={{
            fontFamily: 'monospace',
            color: '#c8a730',
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {formatTimestamp(now)}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────── Page Header ─────────────────── */
const PageHeader: React.FC<{ page: Page }> = ({ page }) => {
  const info: Record<Page, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'PAINEL PRINCIPAL',
      subtitle: 'Visão geral operacional — Delegacia Digital PCSP',
    },
    individuals: {
      title: 'CADASTRO DE INDIVÍDUOS',
      subtitle: 'Gerenciamento de investigados e monitorados',
    },
    vehicles: {
      title: 'CADASTRO DE VEÍCULOS',
      subtitle: 'Controle de veículos — DETRAN/SENATRAN integrado',
    },
    warrants: {
      title: 'MÓDULO DE MANDADOS',
      subtitle: 'Emissão, gestão e execução de mandados — TJSP integrado',
    },
    seizures: {
      title: 'CONTROLE DE APREENSÕES',
      subtitle: 'Registro e acompanhamento de materiais apreendidos',
    },
    assets: {
      title: 'CONTROLE DE BENS',
      subtitle: 'Bens bloqueados, sequestrados e apreendidos em processo',
    },
    monitoring: {
      title: 'MONITORAMENTO ELETRÔNICO',
      subtitle: 'Monitoramento em tempo real de alvos e tornozeleiras',
    },
    logs: {
      title: 'LOGS OPERACIONAIS',
      subtitle: 'Registro auditável de todas as ações do sistema',
    },
  };

  const { title, subtitle } = info[page];

  return (
    <div
      style={{
        padding: '14px 24px',
        background: '#fff',
        borderBottom: '1px solid #ddd',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 900, color: '#0d1f3c', letterSpacing: 0.5 }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{subtitle}</div>
    </div>
  );
};

/* ─────────────────── Main Police System ─────────────────── */
const PoliceSystem: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [warrantHistory, setWarrantHistory] = useState<ArrestWarrant[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const addLog = useCallback(
    (action: string, details: string, modulo: string) => {
      const log: SystemLog = {
        id: generateId(),
        timestamp: new Date(),
        action,
        details,
        modulo,
        user: 'Sgt. Junior S.',
      };
      setLogs((prev) => [...prev, log]);
    },
    [],
  );

  const addWarrant = useCallback((warrant: ArrestWarrant) => {
    setWarrantHistory((prev) => [...prev, warrant]);
  }, []);

  const updateWarrant = useCallback((id: string, status: WarrantStatus) => {
    setWarrantHistory((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status } : w)),
    );
    addLog(
      `Mandado atualizado → ${status}`,
      `ID: ${id}`,
      'MANDADOS',
    );
  }, [addLog]);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    addLog(
      `Navegação: ${page.toUpperCase()}`,
      `Módulo acessado pelo operador`,
      'SISTEMA',
    );
  }, [addLog]);

  // Initial system log
  useEffect(() => {
    addLog('Sistema iniciado', 'Sessão operacional iniciada — PCSP Delegacia Digital', 'SISTEMA');
    addLog('Autenticação confirmada', 'Usuário: Sgt. Junior S. | Nível: OPERACIONAL', 'SISTEMA');
  }, [addLog]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        logCount={logs.length}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Status bar */}
        <StatusBar />

        {/* Page header */}
        <PageHeader page={currentPage} />

        {/* Page content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            background: '#eaecef',
          }}
        >
          {currentPage === 'dashboard' && (
            <DashboardPage warrantHistory={warrantHistory} logs={logs} />
          )}
          {currentPage === 'individuals' && <IndividualsPage />}
          {currentPage === 'vehicles' && <VehiclesPage />}
          {currentPage === 'warrants' && (
            <WarrantsPage
              warrantHistory={warrantHistory}
              onAddWarrant={addWarrant}
              onUpdateWarrant={updateWarrant}
              onAddLog={addLog}
            />
          )}
          {currentPage === 'seizures' && <SeizuresPage />}
          {currentPage === 'assets' && <AssetsPage />}
          {currentPage === 'monitoring' && <MonitoringPage />}
          {currentPage === 'logs' && <LogsPage logs={logs} />}
        </div>
      </div>
    </div>
  );
};

export default PoliceSystem;
