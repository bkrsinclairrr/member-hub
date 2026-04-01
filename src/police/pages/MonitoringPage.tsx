import React, { useState, useEffect } from 'react';

interface Target {
  id: string;
  nome: string;
  cpf: string;
  localizacao: string;
  dispositivo: string;
  ultimaAtualizacao: string;
  status: 'ATIVO' | 'INATIVO' | 'LOCALIZADO' | 'FORAGIDO';
  risco: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'EXTREMO';
}

const TARGETS: Target[] = [
  {
    id: '1',
    nome: 'Roberto Carlos Ferreira',
    cpf: '347.892.104-55',
    localizacao: 'Zona Sul — SP (última triangulação)',
    dispositivo: 'Tornozeleira TR-7821',
    ultimaAtualizacao: '2026-04-01T03:22:00',
    status: 'ATIVO',
    risco: 'ALTO',
  },
  {
    id: '2',
    nome: 'Antônio Silva Ramos',
    cpf: '056.781.230-44',
    localizacao: 'Desconhecida',
    dispositivo: 'Sem monitoramento eletrônico',
    ultimaAtualizacao: '2026-02-14T10:00:00',
    status: 'FORAGIDO',
    risco: 'EXTREMO',
  },
  {
    id: '3',
    nome: 'Marcus Vinícius dos Santos',
    cpf: '129.345.678-90',
    localizacao: 'Campinas — SP (residência)',
    dispositivo: 'Tornozeleira TR-4490',
    ultimaAtualizacao: '2026-04-01T02:58:00',
    status: 'ATIVO',
    risco: 'MÉDIO',
  },
];

const riscoCores: Record<string, string> = {
  BAIXO: '#1a7a1a',
  MÉDIO: '#b37a00',
  ALTO: '#c04000',
  EXTREMO: '#8b0000',
};

const statusCores: Record<string, { bg: string; color: string }> = {
  ATIVO: { bg: '#d4edda', color: '#155724' },
  INATIVO: { bg: '#e9ecef', color: '#555' },
  LOCALIZADO: { bg: '#cce5ff', color: '#004085' },
  FORAGIDO: { bg: '#f8d7da', color: '#721c24' },
};

const MonitoringPage: React.FC = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

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
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span>▶ MONITORAMENTO ELETRÔNICO DE ALVOS</span>
        <span
          style={{
            background: '#1a7a1a',
            fontSize: 10,
            padding: '2px 8px',
            fontWeight: 700,
            letterSpacing: 0.5,
            animation: 'pulse 2s infinite',
          }}
        >
          ● AO VIVO
        </span>
      </div>

      {/* System indicators */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Alvos monitorados', value: TARGETS.filter((t) => t.status === 'ATIVO').length, color: '#1a7a1a' },
          { label: 'Foragidos', value: TARGETS.filter((t) => t.status === 'FORAGIDO').length, color: '#8b0000' },
          { label: 'Alertas ativos', value: 1, color: '#b37a00' },
          { label: 'Tornozeleiras online', value: 2, color: '#1a559a' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#fff',
              border: '1px solid #ccc',
              padding: '12px 16px',
              flex: 1,
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Targets table */}
      <div style={{ background: '#fff', border: '1px solid #ccc' }}>
        <div
          style={{
            background: '#1a3a6b',
            color: '#fff',
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Alvos Sob Monitoramento
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f0f2f5' }}>
              {['NOME', 'CPF', 'DISPOSITIVO', 'LOCALIZAÇÃO', 'ÚLTIMA ATUALIZAÇÃO', 'RISCO', 'STATUS'].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: '7px 12px',
                      textAlign: 'left',
                      color: '#444',
                      fontWeight: 700,
                      fontSize: 9,
                      letterSpacing: 0.8,
                      borderBottom: '2px solid #ddd',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {TARGETS.map((t, i) => {
              const sc = statusCores[t.status];
              return (
                <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa' }}>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontWeight: 700 }}>
                    {t.nome}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #eee',
                      fontFamily: 'monospace',
                      fontSize: 11,
                    }}
                  >
                    {t.cpf}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: 11 }}>
                    {t.dispositivo}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: 11 }}>
                    {t.status === 'ATIVO' ? (
                      <span>
                        <span style={{ color: '#1a7a1a', fontSize: 10 }}>● </span>
                        {t.localizacao}
                      </span>
                    ) : (
                      <span style={{ color: '#8b0000' }}>{t.localizacao}</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #eee',
                      fontFamily: 'monospace',
                      fontSize: 10,
                    }}
                  >
                    {new Date(t.ultimaAtualizacao).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontWeight: 700, fontSize: 10, color: riscoCores[t.risco] }}>
                      {t.risco}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
                    <span
                      style={{
                        background: sc.bg,
                        color: sc.color,
                        padding: '2px 8px',
                        fontSize: 9,
                        fontWeight: 700,
                        border: `1px solid ${sc.color}44`,
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alert */}
      <div
        style={{
          marginTop: 16,
          background: '#fff3cd',
          border: '2px solid #ffc107',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, color: '#856404', fontSize: 13 }}>
            ALERTA: Antônio Silva Ramos — FORAGIDO
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            Alvo com mandado de prisão expedido encontra-se em paradeiro desconhecido. Equipes de
            campo acionadas. Último sinal: 14/02/2026.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
