import React, { useState } from 'react';
import { StatusBadge } from './DashboardPage';

interface Seizure {
  id: string;
  tipo: string;
  descricao: string;
  proprietario: string;
  cpf: string;
  mandado: string;
  delegado: string;
  dataApreensao: string;
  status: string;
  valor: string;
}

const SAMPLE_SEIZURES: Seizure[] = [
  {
    id: '1',
    tipo: 'Veículo',
    descricao: 'Honda Civic 2019, cor Preta, placa ABC-1D23',
    proprietario: 'Roberto Carlos Ferreira',
    cpf: '347.892.104-55',
    mandado: 'MP-2025-84729341',
    delegado: 'Sargento Junior S.',
    dataApreensao: '2025-11-14',
    status: 'APREENDIDO',
    valor: 'R$ 78.000,00',
  },
  {
    id: '2',
    tipo: 'Entorpecente',
    descricao: '3,4 kg de cocaína embalada para comércio',
    proprietario: 'Antônio Silva Ramos',
    cpf: '056.781.230-44',
    mandado: 'MP-2025-91823476',
    delegado: 'Sargento Junior S.',
    dataApreensao: '2025-12-02',
    status: 'PERICIADO',
    valor: '–',
  },
  {
    id: '3',
    tipo: 'Arma de fogo',
    descricao: 'Pistola Glock 17, calibre 9mm, sem numeração',
    proprietario: 'Marcus Vinícius dos Santos',
    cpf: '129.345.678-90',
    mandado: 'MP-2026-10293847',
    delegado: 'Sargento Junior S.',
    dataApreensao: '2026-01-07',
    status: 'APREENDIDO',
    valor: '–',
  },
  {
    id: '4',
    tipo: 'Dinheiro em espécie',
    descricao: 'R$ 142.000,00 em cédulas sem origem comprovada',
    proprietario: 'Fernando Luiz Oliveira',
    cpf: '883.221.456-77',
    mandado: 'MP-2026-29384756',
    delegado: 'Sargento Junior S.',
    dataApreensao: '2026-02-19',
    status: 'BLOQUEADO',
    valor: 'R$ 142.000,00',
  },
];

const SeizuresPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_SEIZURES.filter(
    (s) =>
      s.proprietario.toLowerCase().includes(search.toLowerCase()) ||
      s.tipo.toLowerCase().includes(search.toLowerCase()) ||
      s.mandado.toLowerCase().includes(search.toLowerCase()),
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
        ▶ CONTROLE DE APREENSÕES
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
          placeholder="Buscar por proprietário, tipo ou nº mandado…"
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
              {['TIPO', 'DESCRIÇÃO', 'PROPRIETÁRIO', 'CPF', 'MANDADO', 'DATA APREENSÃO', 'VALOR EST.', 'STATUS'].map(
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
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa' }}>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', fontWeight: 700 }}>
                  {s.tipo}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', maxWidth: 200 }}>
                  {s.descricao}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                  {s.proprietario}
                </td>
                <td
                  style={{
                    padding: '7px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: 10,
                  }}
                >
                  {s.cpf}
                </td>
                <td
                  style={{
                    padding: '7px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: 9,
                  }}
                >
                  {s.mandado}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee' }}>
                  {new Date(s.dataApreensao + 'T00:00:00').toLocaleDateString('pt-BR')}
                </td>
                <td
                  style={{
                    padding: '7px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                  }}
                >
                  {s.valor}
                </td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid #eee' }}>
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                  Nenhuma apreensão encontrada.
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
          {filtered.length} apreensão(ões) registrada(s)
        </div>
      </div>
    </div>
  );
};

export default SeizuresPage;
