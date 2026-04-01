import React, { useState } from 'react';

interface Asset {
  id: string;
  tipo: string;
  descricao: string;
  proprietario: string;
  valorEstimado: string;
  origem: string;
  processo: string;
  status: string;
  dataRegistro: string;
}

const SAMPLE_ASSETS: Asset[] = [
  {
    id: '1',
    tipo: 'Imóvel',
    descricao: 'Apartamento de 120m², Rua das Acácias, 500, Apto 102, Moema – SP',
    proprietario: 'Roberto Carlos Ferreira',
    valorEstimado: 'R$ 850.000,00',
    origem: 'Produto de crime',
    processo: '1023847-44.2025.8.26.0100',
    status: 'BLOQUEADO',
    dataRegistro: '2025-10-18',
  },
  {
    id: '2',
    tipo: 'Veículo de luxo',
    descricao: 'BMW X5 2022, cor Branca, placa DEF-2G34',
    proprietario: 'Fernando Luiz Oliveira',
    valorEstimado: 'R$ 420.000,00',
    origem: 'Não declarado',
    processo: '2938475-11.2026.8.26.0200',
    status: 'SEQUESTRADO',
    dataRegistro: '2026-01-22',
  },
  {
    id: '3',
    tipo: 'Conta bancária',
    descricao: 'Conta corrente Banco do Brasil, Ag. 1234-5, CC 67890-1',
    proprietario: 'Antônio Silva Ramos',
    valorEstimado: 'R$ 234.500,00',
    origem: 'Lavagem de dinheiro',
    processo: '8374619-22.2026.8.26.0310',
    status: 'BLOQUEADO',
    dataRegistro: '2026-02-05',
  },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  BLOQUEADO: { bg: '#fff3cd', color: '#856404' },
  SEQUESTRADO: { bg: '#f8d7da', color: '#721c24' },
  DEVOLVIDO: { bg: '#d4edda', color: '#155724' },
  LEILOADO: { bg: '#cce5ff', color: '#004085' },
};

const AssetsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_ASSETS.filter(
    (a) =>
      a.proprietario.toLowerCase().includes(search.toLowerCase()) ||
      a.tipo.toLowerCase().includes(search.toLowerCase()),
  );

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
        ▶ CONTROLE DE BENS
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>
          Buscar:
        </span>
        <input
          type="text"
          placeholder="Buscar por tipo ou proprietário…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: '1px solid #ccc',
            padding: '5px 10px',
            fontSize: 12,
            flex: 1,
            outline: 'none',
          }}
        />
      </div>

      <div style={{ background: '#fff', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#1a3a6b' }}>
              {['TIPO', 'DESCRIÇÃO', 'PROPRIETÁRIO', 'VALOR EST.', 'ORIGEM', 'Nº PROCESSO', 'DATA REG.', 'STATUS'].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 10px',
                      textAlign: 'left',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 9,
                      letterSpacing: 0.8,
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa' }}>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', fontWeight: 700 }}>
                  {a.tipo}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', maxWidth: 220 }}>
                  {a.descricao}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                  {a.proprietario}
                </td>
                <td
                  style={{
                    padding: '7px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                >
                  {a.valorEstimado}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', color: '#8b0000', fontSize: 10 }}>
                  {a.origem}
                </td>
                <td
                  style={{
                    padding: '7px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: 9,
                  }}
                >
                  {a.processo}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee' }}>
                  {new Date(a.dataRegistro + 'T00:00:00').toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee' }}>
                  {(() => {
                    const c = statusColors[a.status] ?? { bg: '#e9ecef', color: '#333' };
                    return (
                      <span
                        style={{
                          background: c.bg,
                          color: c.color,
                          padding: '2px 8px',
                          fontSize: 9,
                          fontWeight: 700,
                          border: `1px solid ${c.color}44`,
                        }}
                      >
                        {a.status}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                  Nenhum bem registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div
          style={{
            padding: '8px 12px',
            fontSize: 11,
            color: '#888',
            borderTop: '1px solid #eee',
            background: '#f7f8fa',
          }}
        >
          {filtered.length} bem(ns) registrado(s)
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;
