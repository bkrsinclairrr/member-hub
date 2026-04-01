import React from 'react';
import type { ArrestWarrant, SystemLog } from '../types';
import { formatTimestamp } from '../utils';

interface DashboardPageProps {
  warrantHistory: ArrestWarrant[];
  logs: SystemLog[];
}

const StatCard: React.FC<{
  label: string;
  value: number;
  color: string;
  icon: string;
}> = ({ label, value, color, icon }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #ccc',
      padding: '16px 20px',
      minWidth: 140,
    }}
  >
    <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>
      {label}
    </div>
  </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ warrantHistory, logs }) => {
  const total = warrantHistory.length;
  const deferidos = warrantHistory.filter((w) => w.status === 'DEFERIDO').length;
  const emAnalise = warrantHistory.filter((w) => w.status === 'EM ANÁLISE').length;
  const cumpridos = warrantHistory.filter((w) => w.status === 'CUMPRIDO').length;
  const indeferidos = warrantHistory.filter((w) => w.status === 'INDEFERIDO').length;

  return (
    <div>
      <div
        style={{
          background: '#0d1f3c',
          color: '#fff',
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 1,
          marginBottom: 20,
          textTransform: 'uppercase',
          borderLeft: '4px solid #c8a730',
        }}
      >
        ▶ PAINEL OPERACIONAL — DELEGACIA DIGITAL PCSP
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Mandados" value={total} color="#0d1f3c" icon="⚖️" />
        <StatCard label="Deferidos" value={deferidos} color="#1a7a1a" icon="✅" />
        <StatCard label="Em Análise" value={emAnalise} color="#b37a00" icon="⏳" />
        <StatCard label="Cumpridos" value={cumpridos} color="#1a559a" icon="🔒" />
        <StatCard label="Indeferidos" value={indeferidos} color="#8b0000" icon="❌" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent warrants */}
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 0 }}>
          <div
            style={{
              background: '#1a3a6b',
              color: '#fff',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Últimos Mandados Protocolados
          </div>
          {warrantHistory.length === 0 ? (
            <div style={{ padding: 20, fontSize: 12, color: '#888' }}>
              Nenhum mandado registrado.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#f0f2f5' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#444' }}>Nº MANDADO</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#444' }}>NOME</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#444' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[...warrantHistory]
                  .reverse()
                  .slice(0, 8)
                  .map((w, i) => (
                    <tr
                      key={w.id}
                      style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa' }}
                    >
                      <td
                        style={{
                          padding: '5px 10px',
                          borderBottom: '1px solid #eee',
                          fontFamily: 'monospace',
                          fontSize: 10,
                        }}
                      >
                        {w.numero}
                      </td>
                      <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee' }}>
                        {w.nome}
                      </td>
                      <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee' }}>
                        <StatusBadge status={w.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent logs */}
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 0 }}>
          <div
            style={{
              background: '#1a3a6b',
              color: '#fff',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Log de Atividade Recente
          </div>
          {logs.length === 0 ? (
            <div style={{ padding: 20, fontSize: 12, color: '#888' }}>
              Nenhuma atividade registrada.
            </div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {[...logs]
                .reverse()
                .slice(0, 12)
                .map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '7px 12px',
                      borderBottom: '1px solid #eee',
                      fontSize: 11,
                    }}
                  >
                    <div style={{ color: '#888', fontFamily: 'monospace', fontSize: 10 }}>
                      {formatTimestamp(log.timestamp)}
                    </div>
                    <div style={{ fontWeight: 600, color: '#222' }}>{log.action}</div>
                    <div style={{ color: '#555' }}>{log.details}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* System status */}
      <div
        style={{
          marginTop: 20,
          background: '#fff',
          border: '1px solid #ccc',
          padding: '12px 16px',
          fontSize: 12,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: '#0d1f3c',
            fontSize: 11,
          }}
        >
          Status do Sistema
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'SISP/SINESP', status: 'ONLINE' },
            { label: 'SIM – Sistema de Mandados', status: 'ONLINE' },
            { label: 'TJSP – Interface Judicial', status: 'ONLINE' },
            { label: 'IIRGD', status: 'ONLINE' },
            { label: 'Banco de Dados Biométrico', status: 'ONLINE' },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#1a7a1a', fontSize: 16 }}>●</span>
              <span style={{ color: '#444' }}>
                {s.label}:{' '}
                <span style={{ color: '#1a7a1a', fontWeight: 600 }}>{s.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    DEFERIDO: { bg: '#d4edda', color: '#155724' },
    'EM ANÁLISE': { bg: '#fff3cd', color: '#856404' },
    INDEFERIDO: { bg: '#f8d7da', color: '#721c24' },
    CUMPRIDO: { bg: '#cce5ff', color: '#004085' },
    ATIVO: { bg: '#d4edda', color: '#155724' },
    INATIVO: { bg: '#f8d7da', color: '#721c24' },
  };
  const c = colors[status] ?? { bg: '#e9ecef', color: '#333' };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: '2px 8px',
        fontSize: 10,
        fontWeight: 700,
        border: `1px solid ${c.color}44`,
        letterSpacing: 0.5,
      }}
    >
      {status}
    </span>
  );
};

export default DashboardPage;
