import React, { useState } from 'react';

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  proprietario: string;
  cpfProprietario: string;
  situacao: string;
  ocorrencias: number;
}

const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: '1',
    placa: 'ABC-1D23',
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2019,
    cor: 'Preto',
    proprietario: 'Roberto Carlos Ferreira',
    cpfProprietario: '347.892.104-55',
    situacao: 'RESTRIÇÃO',
    ocorrencias: 2,
  },
  {
    id: '2',
    placa: 'XYZ-5E67',
    modelo: 'Corolla',
    marca: 'Toyota',
    ano: 2021,
    cor: 'Branco',
    proprietario: 'Marcus Vinícius dos Santos',
    cpfProprietario: '129.345.678-90',
    situacao: 'REGULAR',
    ocorrencias: 0,
  },
  {
    id: '3',
    placa: 'GHJ-2F89',
    modelo: 'Onix',
    marca: 'Chevrolet',
    ano: 2018,
    cor: 'Prata',
    proprietario: 'Antônio Silva Ramos',
    cpfProprietario: '056.781.230-44',
    situacao: 'ROUBADO',
    ocorrencias: 1,
  },
  {
    id: '4',
    placa: 'MNP-9K34',
    modelo: 'Gol',
    marca: 'Volkswagen',
    ano: 2015,
    cor: 'Vermelho',
    proprietario: 'Fernando Luiz Oliveira',
    cpfProprietario: '883.221.456-77',
    situacao: 'REGULAR',
    ocorrencias: 0,
  },
];

const situacaoColor: Record<string, { bg: string; color: string }> = {
  REGULAR: { bg: '#d4edda', color: '#155724' },
  RESTRIÇÃO: { bg: '#fff3cd', color: '#856404' },
  ROUBADO: { bg: '#f8d7da', color: '#721c24' },
  APREENDIDO: { bg: '#cce5ff', color: '#004085' },
};

const VehiclesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('TODOS');

  const filtered = SAMPLE_VEHICLES.filter((v) => {
    const matchSearch =
      v.placa.toLowerCase().includes(search.toLowerCase()) ||
      v.proprietario.toLowerCase().includes(search.toLowerCase()) ||
      v.modelo.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'TODOS' || v.situacao === filter;
    return matchSearch && matchFilter;
  });

  const SituacaoBadge: React.FC<{ situacao: string }> = ({ situacao }) => {
    const c = situacaoColor[situacao] ?? { bg: '#e9ecef', color: '#333' };
    return (
      <span
        style={{
          background: c.bg,
          color: c.color,
          padding: '2px 8px',
          fontSize: 10,
          fontWeight: 700,
          border: `1px solid ${c.color}44`,
        }}
      >
        {situacao}
      </span>
    );
  };

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
        ▶ CADASTRO DE VEÍCULOS
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
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>
          Filtros:
        </div>
        <input
          type="text"
          placeholder="Buscar por placa, modelo ou proprietário…"
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
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ border: '1px solid #ccc', padding: '5px 8px', fontSize: 12, outline: 'none' }}
        >
          <option value="TODOS">TODAS AS SITUAÇÕES</option>
          <option value="REGULAR">REGULAR</option>
          <option value="RESTRIÇÃO">RESTRIÇÃO</option>
          <option value="ROUBADO">ROUBADO</option>
          <option value="APREENDIDO">APREENDIDO</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#1a3a6b' }}>
              {['PLACA', 'MODELO/MARCA', 'ANO', 'COR', 'PROPRIETÁRIO', 'CPF', 'OCORRÊNCIAS', 'SITUAÇÃO'].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 10,
                      letterSpacing: 0.8,
                      borderRight: '1px solid #2a4a7b',
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <tr key={v.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa' }}>
                <td
                  style={{
                    padding: '7px 12px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {v.placa}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee' }}>
                  {v.marca} {v.modelo}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee' }}>{v.ano}</td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee' }}>{v.cor}</td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                  {v.proprietario}
                </td>
                <td
                  style={{
                    padding: '7px 12px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: 11,
                  }}
                >
                  {v.cpfProprietario}
                </td>
                <td
                  style={{
                    padding: '7px 12px',
                    borderBottom: '1px solid #eee',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: v.ocorrencias > 0 ? '#8b0000' : '#555',
                  }}
                >
                  {v.ocorrencias}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee' }}>
                  <SituacaoBadge situacao={v.situacao} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                  Nenhum veículo encontrado.
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
          {filtered.length} veículo(s) encontrado(s)
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
