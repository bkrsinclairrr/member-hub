import React, { useState } from 'react';
import { StatusBadge } from './DashboardPage';

interface Individual {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  naturalidade: string;
  endereco: string;
  status: string;
  antecedentes: number;
}

const SAMPLE_INDIVIDUALS: Individual[] = [
  {
    id: '1',
    nome: 'Roberto Carlos Ferreira',
    cpf: '347.892.104-55',
    dataNascimento: '1985-03-12',
    naturalidade: 'São Paulo – SP',
    endereco: 'Rua das Palmeiras, 234, Bairro Jardim América, São Paulo – SP',
    status: 'ATIVO',
    antecedentes: 3,
  },
  {
    id: '2',
    nome: 'Marcus Vinícius dos Santos',
    cpf: '129.345.678-90',
    dataNascimento: '1990-07-22',
    naturalidade: 'Campinas – SP',
    endereco: 'Av. Brasil, 1200, Apto 45, Campinas – SP',
    status: 'INATIVO',
    antecedentes: 1,
  },
  {
    id: '3',
    nome: 'Antônio Silva Ramos',
    cpf: '056.781.230-44',
    dataNascimento: '1978-11-03',
    naturalidade: 'Santos – SP',
    endereco: 'Rua XV de Novembro, 89, Santos – SP',
    status: 'ATIVO',
    antecedentes: 5,
  },
  {
    id: '4',
    nome: 'Fernando Luiz Oliveira',
    cpf: '883.221.456-77',
    dataNascimento: '1995-01-18',
    naturalidade: 'Guarulhos – SP',
    endereco: 'Rua Ipiranga, 560, Guarulhos – SP',
    status: 'ATIVO',
    antecedentes: 0,
  },
  {
    id: '5',
    nome: 'Paulo Henrique Nascimento',
    cpf: '741.563.298-33',
    dataNascimento: '1983-09-29',
    naturalidade: 'São Bernardo do Campo – SP',
    endereco: 'Rua Tiradentes, 77, São Bernardo – SP',
    status: 'INATIVO',
    antecedentes: 2,
  },
];

const IndividualsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('TODOS');

  const filtered = SAMPLE_INDIVIDUALS.filter((ind) => {
    const matchSearch =
      ind.nome.toLowerCase().includes(search.toLowerCase()) ||
      ind.cpf.includes(search);
    const matchFilter = filter === 'TODOS' || ind.status === filter;
    return matchSearch && matchFilter;
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
        ▶ CADASTRO DE INDIVÍDUOS
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
        <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>
          Filtros:
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou CPF…"
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
          style={{
            border: '1px solid #ccc',
            padding: '5px 8px',
            fontSize: 12,
            outline: 'none',
          }}
        >
          <option value="TODOS">TODOS OS STATUS</option>
          <option value="ATIVO">ATIVO</option>
          <option value="INATIVO">INATIVO</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#1a3a6b' }}>
              {['Nº', 'NOME COMPLETO', 'CPF', 'DATA NASC.', 'NATURALIDADE', 'ANTECEDENTES', 'STATUS'].map(
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
            {filtered.map((ind, i) => (
              <tr
                key={ind.id}
                style={{
                  background: i % 2 === 0 ? '#fff' : '#f7f8fa',
                  cursor: 'pointer',
                }}
              >
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee', color: '#888', fontFamily: 'monospace', fontSize: 11 }}>
                  {String(i + 1).padStart(3, '0')}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                  {ind.nome}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: 11 }}>
                  {ind.cpf}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee' }}>
                  {new Date(ind.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee' }}>
                  {ind.naturalidade}
                </td>
                <td
                  style={{
                    padding: '7px 12px',
                    borderBottom: '1px solid #eee',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: ind.antecedentes > 3 ? '#8b0000' : ind.antecedentes > 0 ? '#b37a00' : '#555',
                  }}
                >
                  {ind.antecedentes}
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #eee' }}>
                  <StatusBadge status={ind.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: 20, textAlign: 'center', color: '#888', fontSize: 12 }}
                >
                  Nenhum registro encontrado.
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
          {filtered.length} registro(s) encontrado(s)
        </div>
      </div>
    </div>
  );
};

export default IndividualsPage;
