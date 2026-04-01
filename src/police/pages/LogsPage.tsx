import React, { useState } from 'react';
import type { SystemLog } from '../types';
import { formatTimestamp } from '../utils';

interface LogsPageProps {
  logs: SystemLog[];
}

const moduloColors: Record<string, { bg: string; color: string }> = {
  MANDADOS: { bg: '#f8d7da', color: '#721c24' },
  INDIVÍDUOS: { bg: '#d1ecf1', color: '#0c5460' },
  VEÍCULOS: { bg: '#d4edda', color: '#155724' },
  APREENSÕES: { bg: '#fff3cd', color: '#856404' },
  BENS: { bg: '#cce5ff', color: '#004085' },
  MONITORAMENTO: { bg: '#e2d9f3', color: '#4a1a7a' },
  SISTEMA: { bg: '#e9ecef', color: '#444' },
};

const LogsPage: React.FC<LogsPageProps> = ({ logs }) => {
  const [filterModulo, setFilterModulo] = useState('TODOS');
  const [search, setSearch] = useState('');

  const filtered = [...logs]
    .reverse()
    .filter((log) => {
      const matchModulo = filterModulo === 'TODOS' || log.modulo === filterModulo;
      const matchSearch =
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());
      return matchModulo && matchSearch;
    });

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
          marginBottom: 16,
          textTransform: 'uppercase',
          borderLeft: '4px solid #c8a730',
        }}
      >
        ▶ LOGS OPERACIONAIS DO SISTEMA
      </div>

      {/* Filters */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>
          Filtros:
        </span>
        <input
          type="text"
          placeholder="Buscar na descrição do log…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: '1px solid #ccc',
            padding: '5px 10px',
            fontSize: 12,
            flex: 1,
            minWidth: 200,
            outline: 'none',
          }}
        />
        <select
          value={filterModulo}
          onChange={(e) => setFilterModulo(e.target.value)}
          style={{ border: '1px solid #ccc', padding: '5px 8px', fontSize: 12, outline: 'none' }}
        >
          <option value="TODOS">TODOS OS MÓDULOS</option>
          <option value="MANDADOS">MANDADOS</option>
          <option value="INDIVÍDUOS">INDIVÍDUOS</option>
          <option value="VEÍCULOS">VEÍCULOS</option>
          <option value="APREENSÕES">APREENSÕES</option>
          <option value="BENS">BENS</option>
          <option value="MONITORAMENTO">MONITORAMENTO</option>
          <option value="SISTEMA">SISTEMA</option>
        </select>
        <span style={{ fontSize: 11, color: '#888' }}>
          {filtered.length} registro(s)
        </span>
      </div>

      {/* Log table */}
      <div style={{ background: '#fff', border: '1px solid #ccc' }}>
        {logs.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              color: '#888',
              fontSize: 13,
              fontStyle: 'italic',
            }}
          >
            Nenhuma ação registrada nesta sessão. Os logs são gerados automaticamente a cada operação
            realizada no sistema.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#1a3a6b' }}>
                {['TIMESTAMP', 'MÓDULO', 'AÇÃO', 'DETALHES', 'USUÁRIO'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 9,
                      letterSpacing: 0.8,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const mc = moduloColors[log.modulo] ?? { bg: '#e9ecef', color: '#444' };
                return (
                  <tr key={log.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa' }}>
                    <td
                      style={{
                        padding: '6px 12px',
                        borderBottom: '1px solid #eee',
                        fontFamily: 'monospace',
                        fontSize: 10,
                        whiteSpace: 'nowrap',
                        color: '#555',
                      }}
                    >
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee' }}>
                      <span
                        style={{
                          background: mc.bg,
                          color: mc.color,
                          padding: '2px 7px',
                          fontSize: 9,
                          fontWeight: 700,
                          border: `1px solid ${mc.color}44`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.modulo}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '6px 12px',
                        borderBottom: '1px solid #eee',
                        fontWeight: 600,
                        color: '#222',
                      }}
                    >
                      {log.action}
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', color: '#555', maxWidth: 300 }}>
                      {log.details}
                    </td>
                    <td
                      style={{
                        padding: '6px 12px',
                        borderBottom: '1px solid #eee',
                        color: '#444',
                        fontSize: 10,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.user}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && logs.length > 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                    Nenhum log encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div
          style={{
            padding: '8px 12px',
            fontSize: 10,
            color: '#888',
            borderTop: logs.length > 0 ? '1px solid #eee' : 'none',
            background: '#f7f8fa',
            fontFamily: 'monospace',
          }}
        >
          SESSÃO REGISTRADA — NÍVEL DE ACESSO: OPERACIONAL — USUÁRIO: Sgt. Junior S.
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
