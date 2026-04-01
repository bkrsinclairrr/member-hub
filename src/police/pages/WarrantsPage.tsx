import React, { useState, useEffect, useRef } from 'react';
import type {
  ArrestWarrant,
  ArrestWarrantFormData,
  Periculosidade,
  ProcessingState,
  WarrantStatus,
  WarrantTab,
} from '../types';
import {
  computeDecision,
  formatDate,
  formatTimestamp,
  generateId,
  generateLegalText,
  generateProcessNumber,
  generateWarrantNumber,
  maskCPF,
} from '../utils';
import { StatusBadge } from './DashboardPage';

const CRITERIOS_OPTIONS = [
  'Garantia da ordem pública',
  'Conveniência da instrução criminal',
  'Assegurar a aplicação da lei penal',
  'Risco de fuga',
  'Reincidência',
];

const TIPIFICACAO_SUGESTOES = [
  'Art. 157, §2º, II do CP (Roubo qualificado com emprego de arma de fogo)',
  'Art. 121, §2º, I, III do CP (Homicídio qualificado)',
  'Art. 33 da Lei 11.343/06 (Tráfico de drogas)',
  'Art. 155, §4º, II, IV do CP (Furto qualificado)',
  'Art. 213, §1º do CP (Estupro de vulnerável)',
  'Art. 171, §3º do CP (Estelionato qualificado)',
  'Art. 288 do CP c/c Art. 33 da Lei 11.343/06 (Associação criminosa para o tráfico)',
  'Art. 1º, VII da Lei 9.613/98 (Lavagem de dinheiro)',
  'Art. 16, parágrafo único, IV da Lei 10.826/03 (Posse ilegal de arma de uso restrito)',
];

const DEFAULT_FORM: ArrestWarrantFormData = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  pai: '',
  mae: '',
  nacionalidade: 'Brasileiro(a)',
  endereco: '',
  tipificacao: '',
  descricaoConduta: '',
  fundamentacao: '',
  criterios: ['Garantia da ordem pública'],
  juiz: '',
  vara: '',
  dataDecisao: new Date().toISOString().slice(0, 10),
  periculosidade: 'MÉDIO',
};

/* ─────────────────── Processing Overlay ─────────────────── */
const ProcessingOverlay: React.FC<{
  state: ProcessingState;
  decision: WarrantStatus | null;
  onContinue: () => void;
}> = ({ state, decision, onContinue }) => {
  const steps = [
    'Gerando requisição formal…',
    'Encaminhando ao sistema judiciário…',
    'Distribuindo para vara competente…',
  ];

  const stepIndex =
    state === 'step1' ? 0 : state === 'step2' ? 1 : state === 'step3' ? 2 : 3;

  const decisionColors: Record<string, { bg: string; color: string; label: string; icon: string }> = {
    DEFERIDO: { bg: '#d4edda', color: '#155724', label: 'PEDIDO DEFERIDO', icon: '✅' },
    'EM ANÁLISE': { bg: '#fff3cd', color: '#856404', label: 'EM ANÁLISE JUDICIAL', icon: '⏳' },
    INDEFERIDO: { bg: '#f8d7da', color: '#721c24', label: 'PEDIDO INDEFERIDO', icon: '❌' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          width: 480,
          border: '2px solid #0d1f3c',
          padding: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#0d1f3c',
            color: '#fff',
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>⚖️</span>
          SISTEMA JUDICIÁRIO PCSP — PROCESSANDO PEDIDO
        </div>

        <div style={{ padding: 28 }}>
          {/* Steps */}
          {(state === 'step1' || state === 'step2' || state === 'step3' || state === 'deciding') && (
            <div>
              <div style={{ marginBottom: 20 }}>
                {steps.map((step, idx) => {
                  const done = idx < stepIndex;
                  const current = idx === stepIndex && state !== 'deciding';
                  return (
                    <div
                      key={step}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 0',
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                        {done ? '✅' : current ? '🔄' : '⬜'}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: done ? '#155724' : current ? '#0d1f3c' : '#aaa',
                          fontWeight: done || current ? 600 : 400,
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {state === 'deciding' && (
                <div
                  style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>⏳</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#856404', fontSize: 13 }}>
                      Análise do magistrado em andamento…
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      Aguardando despacho judicial — por favor, aguarde.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {state === 'result' && decision && (
            <div>
              <div
                style={{
                  background: decisionColors[decision].bg,
                  border: `2px solid ${decisionColors[decision].color}`,
                  padding: '20px 24px',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{decisionColors[decision].icon}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: decisionColors[decision].color,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  {decisionColors[decision].label}
                </div>
                {decision === 'DEFERIDO' && (
                  <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
                    Mandado de prisão expedido. O documento está sendo gerado…
                  </div>
                )}
                {decision === 'EM ANÁLISE' && (
                  <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
                    O pedido foi encaminhado para análise complementar pelo magistrado. Aguardar pronunciamento em até 72h.
                  </div>
                )}
                {decision === 'INDEFERIDO' && (
                  <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
                    O pedido foi indeferido. É possível reformular a fundamentação e protocolar novo pedido.
                  </div>
                )}
              </div>

              {decision !== 'DEFERIDO' && (
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={onContinue}
                    style={{
                      background: '#0d1f3c',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 28px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: 1,
                    }}
                  >
                    FECHAR
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Warrant Document ─────────────────── */
const WarrantDocument: React.FC<{
  warrant: ArrestWarrant;
  onMarkCumprido: (id: string) => void;
  onEncaminhar: (id: string) => void;
  onClose: () => void;
}> = ({ warrant, onMarkCumprido, onEncaminhar, onClose }) => {
  const legalText = generateLegalText(warrant);
  const now = new Date();
  const assinatura = `SÃO PAULO, ${formatDate(warrant.dataDecisao).toUpperCase()}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '20px 0',
      }}
    >
      <div style={{ width: 740, maxWidth: '95vw' }}>
        {/* Actions toolbar */}
        <div
          style={{
            background: '#0d1f3c',
            padding: '10px 16px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#c8a730', fontWeight: 700, fontSize: 12, flex: 1 }}>
            ⚖️ MANDADO GERADO — {warrant.numero}
          </span>
          <button
            onClick={() => {
              onEncaminhar(warrant.id);
              alert(
                'Mandado encaminhado para equipe operacional com sucesso.\nRegistro gerado no sistema SIM.',
              );
            }}
            style={{
              background: '#1a559a',
              color: '#fff',
              border: 'none',
              padding: '7px 14px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            📡 ENCAMINHAR PARA EQUIPE
          </button>
          <button
            onClick={() => {
              onMarkCumprido(warrant.id);
              onClose();
            }}
            style={{
              background: '#1a7a1a',
              color: '#fff',
              border: 'none',
              padding: '7px 14px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            🔒 MARCAR COMO CUMPRIDO
          </button>
          <button
            onClick={() =>
              alert(
                'Download simulado: O arquivo PDF do mandado seria gerado e baixado automaticamente pelo sistema.',
              )
            }
            style={{
              background: '#555',
              color: '#fff',
              border: 'none',
              padding: '7px 14px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            ⬇ BAIXAR PDF
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#fff',
              border: '1px solid #666',
              padding: '7px 14px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ✕ FECHAR
          </button>
        </div>

        {/* Document */}
        <div
          style={{
            background: '#fff',
            padding: '40px 48px',
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: 13,
            lineHeight: 1.7,
            color: '#111',
          }}
        >
          {/* Institutional header */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #0d1f3c', paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#0d1f3c', textTransform: 'uppercase' }}>
              PODER JUDICIÁRIO DO ESTADO DE SÃO PAULO
            </div>
            <div style={{ fontSize: 10, color: '#444', marginTop: 2, letterSpacing: 1 }}>
              TRIBUNAL DE JUSTIÇA — COMARCA DE SÃO PAULO
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#555',
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              {warrant.vara}
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#888',
                marginTop: 6,
                fontFamily: 'monospace',
              }}
            >
              Processo nº: {warrant.processo}
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: '#0d1f3c',
                borderTop: '2px solid #c8a730',
                borderBottom: '2px solid #c8a730',
                padding: '8px 0',
                display: 'inline-block',
              }}
            >
              MANDADO DE PRISÃO
            </div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                marginTop: 8,
                fontWeight: 700,
                color: '#8b0000',
                letterSpacing: 1,
              }}
            >
              Nº {warrant.numero}
            </div>
          </div>

          {/* Address line */}
          <p style={{ fontWeight: 700, marginBottom: 16 }}>
            AO SENHOR DELEGADO DE POLÍCIA / AGENTE POLICIAL COMPETENTE:
          </p>

          <p style={{ marginBottom: 16 }}>
            Faço saber que{' '}
            <strong>
              {warrant.juiz}, Juiz(a) de Direito da {warrant.vara}
            </strong>
            , nos autos do processo em epígrafe, <strong>DECRETOU A PRISÃO PREVENTIVA</strong> de:
          </p>

          {/* Subject data box */}
          <div
            style={{
              border: '2px solid #0d1f3c',
              padding: '14px 18px',
              marginBottom: 20,
              background: '#f8f9fa',
            }}
          >
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['NOME:', warrant.nome.toUpperCase()],
                  ['CPF:', warrant.cpf],
                  ['FILIAÇÃO:', `${warrant.pai} (pai) / ${warrant.mae} (mãe)`],
                  [
                    'NASCIMENTO:',
                    formatDate(warrant.dataNascimento),
                  ],
                  ['NACIONALIDADE:', warrant.nacionalidade],
                  ['ENDEREÇO:', warrant.endereco],
                  ['TIPIFICAÇÃO PENAL:', warrant.tipificacao],
                  ['GRAU DE PERICULOSIDADE:', warrant.periculosidade],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #ddd' }}>
                    <td
                      style={{
                        padding: '5px 8px',
                        fontWeight: 700,
                        width: 200,
                        color: '#0d1f3c',
                        verticalAlign: 'top',
                      }}
                    >
                      {label}
                    </td>
                    <td style={{ padding: '5px 8px', fontWeight: label === 'NOME:' ? 700 : 400 }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal text */}
          <div
            style={{
              textAlign: 'justify',
              marginBottom: 24,
              whiteSpace: 'pre-wrap',
              fontSize: 12.5,
            }}
          >
            {legalText}
          </div>

          {/* Signature */}
          <div
            style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop: '1px solid #ccc',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: 40, fontSize: 12 }}>
              {assinatura}
            </div>
            <div
              style={{
                display: 'inline-block',
                borderTop: '2px solid #111',
                paddingTop: 8,
                minWidth: 280,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                {warrant.juiz}
              </div>
              <div style={{ fontSize: 11, color: '#555' }}>Juiz(a) de Direito</div>
              <div style={{ fontSize: 11, color: '#555' }}>{warrant.vara}</div>
            </div>

            {/* Digital stamp */}
            <div
              style={{
                marginTop: 24,
                border: '2px solid #0d1f3c',
                display: 'inline-block',
                padding: '8px 16px',
                marginLeft: 40,
                textAlign: 'center',
                verticalAlign: 'top',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: '#0d1f3c', letterSpacing: 1 }}>
                ⚖ ASSINATURA DIGITAL
              </div>
              <div
                style={{ fontSize: 9, fontFamily: 'monospace', color: '#666', marginTop: 4 }}
              >
                {warrant.numero}
              </div>
              <div style={{ fontSize: 9, color: '#666' }}>
                {formatTimestamp(new Date(warrant.dataProtocolo))}
              </div>
              <div style={{ fontSize: 9, color: '#1a7a1a', fontWeight: 700, marginTop: 2 }}>
                ✓ DOCUMENTO AUTENTICADO — TJSP
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 30,
              borderTop: '1px solid #ddd',
              paddingTop: 10,
              fontSize: 10,
              color: '#888',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Delegado responsável: {warrant.delegado}</span>
            <span>Data de protocolo: {formatTimestamp(new Date(warrant.dataProtocolo))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Arrest Warrant Form Tab ─────────────────── */
const ArrestWarrantTab: React.FC<{
  warrantHistory: ArrestWarrant[];
  onAddWarrant: (w: ArrestWarrant) => void;
  onUpdateWarrant: (id: string, status: WarrantStatus) => void;
  onAddLog: (action: string, details: string, modulo: string) => void;
}> = ({ warrantHistory, onAddWarrant, onUpdateWarrant, onAddLog }) => {
  const [form, setForm] = useState<ArrestWarrantFormData>(DEFAULT_FORM);
  const [processingState, setProcessingState] = useState<ProcessingState>(null);
  const [decision, setDecision] = useState<WarrantStatus | null>(null);
  const [generatedWarrant, setGeneratedWarrant] = useState<ArrestWarrant | null>(null);
  const [showDocument, setShowDocument] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const processoRef = useRef<string>('');

  const updateForm = (field: keyof ArrestWarrantFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleCriterio = (criterio: string) => {
    setForm((prev) => {
      const exists = prev.criterios.includes(criterio);
      return {
        ...prev,
        criterios: exists
          ? prev.criterios.filter((c) => c !== criterio)
          : [...prev.criterios, criterio],
      };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.nome.trim()) newErrors.nome = 'Campo obrigatório';
    if (!form.cpf.trim() || form.cpf.replace(/\D/g, '').length < 11)
      newErrors.cpf = 'CPF inválido ou incompleto';
    if (!form.dataNascimento) newErrors.dataNascimento = 'Campo obrigatório';
    if (!form.endereco.trim()) newErrors.endereco = 'Campo obrigatório';
    if (!form.tipificacao.trim()) newErrors.tipificacao = 'Campo obrigatório';
    if (!form.descricaoConduta.trim()) newErrors.descricaoConduta = 'Campo obrigatório';
    if (!form.fundamentacao.trim()) newErrors.fundamentacao = 'Campo obrigatório';
    if (!form.juiz.trim()) newErrors.juiz = 'Campo obrigatório';
    if (!form.vara.trim()) newErrors.vara = 'Campo obrigatório';
    if (form.criterios.length === 0) newErrors.criterios = 'Selecione ao menos um critério';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProtocolar = () => {
    if (!validate()) return;

    processoRef.current = generateProcessNumber();
    setProcessingState('step1');
    onAddLog(
      'Pedido de prisão protocolado',
      `Investigado: ${form.nome} | Tipificação: ${form.tipificacao}`,
      'MANDADOS',
    );

    setTimeout(() => setProcessingState('step2'), 1600);
    setTimeout(() => setProcessingState('step3'), 3200);
    setTimeout(() => setProcessingState('deciding'), 4800);
    setTimeout(() => {
      const d = computeDecision(form.periculosidade, form.fundamentacao);
      setDecision(d);
      setProcessingState('result');

      const warrant: ArrestWarrant = {
        id: generateId(),
        numero: generateWarrantNumber(),
        processo: processoRef.current,
        delegado: 'Sargento Junior S.',
        status: d,
        dataProtocolo: new Date().toISOString(),
        ...form,
      };

      if (d === 'DEFERIDO') {
        setGeneratedWarrant(warrant);
        onAddWarrant(warrant);
        onAddLog('Mandado deferido', `Nº ${warrant.numero} | Investigado: ${form.nome}`, 'MANDADOS');
        setTimeout(() => {
          setProcessingState('document');
          setShowDocument(true);
          onAddLog('Documento gerado', `Mandado ${warrant.numero} emitido`, 'MANDADOS');
        }, 2200);
      } else {
        onAddWarrant(warrant);
        onAddLog(
          `Pedido ${d}`,
          `Investigado: ${form.nome} | Motivo: ${d === 'INDEFERIDO' ? 'Fundamentação insuficiente' : 'Aguardando análise complementar'}`,
          'MANDADOS',
        );
      }
    }, 6800);
  };

  const handleContinue = () => {
    setProcessingState(null);
    setDecision(null);
    setGeneratedWarrant(null);
    setShowDocument(false);
    setForm(DEFAULT_FORM);
  };

  const handleMarkCumprido = (id: string) => {
    onUpdateWarrant(id, 'CUMPRIDO');
    onAddLog('Mandado cumprido', `Mandado ${generatedWarrant?.numero} marcado como cumprido`, 'MANDADOS');
  };

  const handleEncaminhar = (id: string) => {
    onAddLog(
      'Encaminhado para execução',
      `Mandado ${generatedWarrant?.numero} encaminhado para equipe operacional`,
      'MANDADOS',
    );
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #bbb',
    padding: '6px 10px',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    display: 'block',
    marginBottom: 3,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    background: '#1a3a6b',
    color: '#fff',
    padding: '6px 12px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 20,
  };

  const errorStyle: React.CSSProperties = {
    color: '#8b0000',
    fontSize: 10,
    marginTop: 2,
  };

  const periculosidadeColors: Record<string, string> = {
    BAIXO: '#1a7a1a',
    MÉDIO: '#b37a00',
    ALTO: '#c04000',
    EXTREMO: '#8b0000',
  };

  return (
    <div>
      {/* Processing overlay */}
      {processingState && processingState !== 'document' && (
        <ProcessingOverlay
          state={processingState}
          decision={decision}
          onContinue={handleContinue}
        />
      )}

      {/* Document overlay */}
      {showDocument && generatedWarrant && (
        <WarrantDocument
          warrant={generatedWarrant}
          onMarkCumprido={handleMarkCumprido}
          onEncaminhar={handleEncaminhar}
          onClose={handleContinue}
        />
      )}

      {/* Auto-generated fields banner */}
      <div
        style={{
          background: '#fffde7',
          border: '1px solid #ffd54f',
          padding: '8px 14px',
          marginBottom: 16,
          fontSize: 11,
          color: '#555',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>ℹ️</span>
        <span>
          <strong>Delegado responsável:</strong> Sargento Junior S. &nbsp;|&nbsp;
          <strong>Nº do processo:</strong> Gerado automaticamente após protocolo &nbsp;|&nbsp;
          <strong>Status inicial:</strong> Aguardando deferimento
        </span>
      </div>

      {/* SECTION: Dados do Investigado */}
      <div style={sectionHeaderStyle}>🔹 I — DADOS DO INVESTIGADO</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nome completo *</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => updateForm('nome', e.target.value)}
            placeholder="Nome completo do investigado"
            style={{ ...fieldStyle, borderColor: errors.nome ? '#8b0000' : '#bbb' }}
          />
          {errors.nome && <div style={errorStyle}>{errors.nome}</div>}
        </div>
        <div>
          <label style={labelStyle}>CPF *</label>
          <input
            type="text"
            value={form.cpf}
            onChange={(e) => updateForm('cpf', maskCPF(e.target.value))}
            placeholder="000.000.000-00"
            maxLength={14}
            style={{ ...fieldStyle, fontFamily: 'monospace', borderColor: errors.cpf ? '#8b0000' : '#bbb' }}
          />
          {errors.cpf && <div style={errorStyle}>{errors.cpf}</div>}
        </div>
        <div>
          <label style={labelStyle}>Data de nascimento *</label>
          <input
            type="date"
            value={form.dataNascimento}
            onChange={(e) => updateForm('dataNascimento', e.target.value)}
            style={{ ...fieldStyle, borderColor: errors.dataNascimento ? '#8b0000' : '#bbb' }}
          />
          {errors.dataNascimento && <div style={errorStyle}>{errors.dataNascimento}</div>}
        </div>
        <div>
          <label style={labelStyle}>Nome do pai</label>
          <input
            type="text"
            value={form.pai}
            onChange={(e) => updateForm('pai', e.target.value)}
            placeholder="Nome completo do pai (ou 'Não informado')"
            style={fieldStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Nome da mãe</label>
          <input
            type="text"
            value={form.mae}
            onChange={(e) => updateForm('mae', e.target.value)}
            placeholder="Nome completo da mãe"
            style={fieldStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Nacionalidade</label>
          <input
            type="text"
            value={form.nacionalidade}
            onChange={(e) => updateForm('nacionalidade', e.target.value)}
            style={fieldStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Endereço completo *</label>
          <input
            type="text"
            value={form.endereco}
            onChange={(e) => updateForm('endereco', e.target.value)}
            placeholder="Logradouro, nº, complemento, bairro, cidade – UF"
            style={{ ...fieldStyle, borderColor: errors.endereco ? '#8b0000' : '#bbb' }}
          />
          {errors.endereco && <div style={errorStyle}>{errors.endereco}</div>}
        </div>
      </div>

      {/* SECTION: Fundamentação Legal */}
      <div style={sectionHeaderStyle}>🔹 II — FUNDAMENTAÇÃO LEGAL</div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Tipificação penal *</label>
        <input
          type="text"
          value={form.tipificacao}
          onChange={(e) => updateForm('tipificacao', e.target.value)}
          placeholder="Ex: Art. 157, §2º, II do CP (Roubo qualificado)"
          list="tipificacao-list"
          style={{ ...fieldStyle, borderColor: errors.tipificacao ? '#8b0000' : '#bbb' }}
        />
        <datalist id="tipificacao-list">
          {TIPIFICACAO_SUGESTOES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {errors.tipificacao && <div style={errorStyle}>{errors.tipificacao}</div>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Descrição da conduta *</label>
        <textarea
          value={form.descricaoConduta}
          onChange={(e) => updateForm('descricaoConduta', e.target.value)}
          placeholder="Descreva detalhadamente a conduta criminosa imputada ao investigado…"
          rows={4}
          style={{ ...fieldStyle, resize: 'vertical', borderColor: errors.descricaoConduta ? '#8b0000' : '#bbb' }}
        />
        {errors.descricaoConduta && <div style={errorStyle}>{errors.descricaoConduta}</div>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Fundamentação do pedido * (linguagem jurídica)</label>
        <textarea
          value={form.fundamentacao}
          onChange={(e) => updateForm('fundamentacao', e.target.value)}
          placeholder="Apresente os fundamentos jurídicos e fáticos que embasam o pedido de prisão preventiva, demonstrando a presença dos requisitos do art. 312 do CPP…"
          rows={7}
          style={{ ...fieldStyle, resize: 'vertical', borderColor: errors.fundamentacao ? '#8b0000' : '#bbb' }}
        />
        <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>
          {form.fundamentacao.length} caracteres — Recomendado: no mínimo 300 caracteres para embasamento adequado
        </div>
        {errors.fundamentacao && <div style={errorStyle}>{errors.fundamentacao}</div>}
      </div>

      {/* SECTION: Critérios para Prisão */}
      <div style={sectionHeaderStyle}>🔹 III — CRITÉRIOS PARA PRISÃO (art. 312 CPP)</div>
      <div style={{ marginBottom: 12 }}>
        {errors.criterios && <div style={{ ...errorStyle, marginBottom: 6 }}>{errors.criterios}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {CRITERIOS_OPTIONS.map((criterio) => (
            <label
              key={criterio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                border: `1px solid ${form.criterios.includes(criterio) ? '#1a3a6b' : '#ddd'}`,
                background: form.criterios.includes(criterio) ? '#e8eef7' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 0.1s',
              }}
            >
              <input
                type="checkbox"
                checked={form.criterios.includes(criterio)}
                onChange={() => toggleCriterio(criterio)}
                style={{ cursor: 'pointer' }}
              />
              {criterio}
            </label>
          ))}
        </div>
      </div>

      {/* SECTION: Dados Judiciais */}
      <div style={sectionHeaderStyle}>🔹 IV — DADOS JUDICIAIS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Delegado responsável</label>
          <input
            type="text"
            value="Sargento Junior S."
            readOnly
            style={{ ...fieldStyle, background: '#f0f0f0', color: '#555', cursor: 'not-allowed' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Juiz competente *</label>
          <input
            type="text"
            value={form.juiz}
            onChange={(e) => updateForm('juiz', e.target.value)}
            placeholder="Ex: Dr. Carlos Henrique de Souza"
            style={{ ...fieldStyle, borderColor: errors.juiz ? '#8b0000' : '#bbb' }}
          />
          {errors.juiz && <div style={errorStyle}>{errors.juiz}</div>}
        </div>
        <div>
          <label style={labelStyle}>Vara *</label>
          <input
            type="text"
            value={form.vara}
            onChange={(e) => updateForm('vara', e.target.value)}
            placeholder="Ex: 3ª Vara Criminal da Comarca de São Paulo"
            style={{ ...fieldStyle, borderColor: errors.vara ? '#8b0000' : '#bbb' }}
          />
          {errors.vara && <div style={errorStyle}>{errors.vara}</div>}
        </div>
        <div>
          <label style={labelStyle}>Data da decisão</label>
          <input
            type="date"
            value={form.dataDecisao}
            onChange={(e) => updateForm('dataDecisao', e.target.value)}
            style={fieldStyle}
          />
        </div>
      </div>

      {/* SECTION: Classificação Operacional */}
      <div style={sectionHeaderStyle}>🔹 V — CLASSIFICAÇÃO OPERACIONAL</div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Grau de periculosidade</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['BAIXO', 'MÉDIO', 'ALTO', 'EXTREMO'] as Periculosidade[]).map((grau) => (
            <button
              key={grau}
              onClick={() => updateForm('periculosidade', grau)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: `2px solid ${periculosidadeColors[grau]}`,
                background: form.periculosidade === grau ? periculosidadeColors[grau] : '#fff',
                color: form.periculosidade === grau ? '#fff' : periculosidadeColors[grau],
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                letterSpacing: 0.5,
                transition: 'all 0.15s',
              }}
            >
              {grau}
            </button>
          ))}
        </div>
      </div>

      {/* Status initial badge */}
      <div
        style={{
          background: '#f7f8fa',
          border: '1px solid #ddd',
          padding: '10px 14px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: '#555',
        }}
      >
        <span style={{ fontWeight: 700 }}>Status inicial:</span>
        <span
          style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 700,
            border: '1px solid #ffc10744',
          }}
        >
          AGUARDANDO DEFERIMENTO
        </span>
      </div>

      {/* Primary action button */}
      <button
        onClick={handleProtocolar}
        style={{
          width: '100%',
          background: '#8b0000',
          color: '#fff',
          border: 'none',
          padding: '16px 0',
          fontSize: 16,
          fontWeight: 900,
          cursor: 'pointer',
          letterSpacing: 2,
          textTransform: 'uppercase',
          transition: 'background 0.15s',
          boxShadow: '0 2px 8px rgba(139,0,0,0.3)',
        }}
        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = '#6b0000')}
        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = '#8b0000')}
      >
        ⚖ PROTOCOLAR PEDIDO DE PRISÃO
      </button>
    </div>
  );
};

/* ─────────────────── Search Warrant Tab ─────────────────── */
const SearchWarrantTab: React.FC = () => (
  <div style={{ color: '#555', fontSize: 13 }}>
    <div
      style={{
        background: '#fffde7',
        border: '1px solid #ffd54f',
        padding: '14px 18px',
        marginBottom: 20,
        fontSize: 12,
      }}
    >
      ℹ️ Módulo de Mandado de Busca e Apreensão — Em desenvolvimento. Os procedimentos seguem o rito
      previsto nos arts. 240 a 250 do Código de Processo Penal.
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[
        'Endereço a ser vistoriado',
        'Objeto / pessoa a ser localizada',
        'Fundamentação do pedido',
        'Juiz competente',
        'Vara / Comarca',
        'Data da diligência',
      ].map((field) => (
        <div key={field}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#555',
              display: 'block',
              marginBottom: 3,
              textTransform: 'uppercase',
            }}
          >
            {field}
          </label>
          <input
            type="text"
            disabled
            placeholder="Módulo em desenvolvimento"
            style={{
              width: '100%',
              border: '1px solid #ddd',
              padding: '6px 10px',
              fontSize: 12,
              background: '#f5f5f5',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────── Asset Seizure Tab ─────────────────── */
const AssetSeizureTab: React.FC = () => (
  <div style={{ color: '#555', fontSize: 13 }}>
    <div
      style={{
        background: '#fffde7',
        border: '1px solid #ffd54f',
        padding: '14px 18px',
        marginBottom: 20,
        fontSize: 12,
      }}
    >
      ℹ️ Módulo de Ordem de Apreensão de Bens — Em desenvolvimento. Procedimentos conforme Lei
      9.613/98 (Lavagem de Dinheiro) e arts. 91 e 91-A do Código Penal.
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[
        'Proprietário dos bens',
        'Tipo dos bens',
        'Estimativa de valor',
        'Localização dos bens',
        'Fundamentação legal',
        'Juiz competente',
      ].map((field) => (
        <div key={field}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#555',
              display: 'block',
              marginBottom: 3,
              textTransform: 'uppercase',
            }}
          >
            {field}
          </label>
          <input
            type="text"
            disabled
            placeholder="Módulo em desenvolvimento"
            style={{
              width: '100%',
              border: '1px solid #ddd',
              padding: '6px 10px',
              fontSize: 12,
              background: '#f5f5f5',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────── Warrant History Tab ─────────────────── */
const WarrantHistoryTab: React.FC<{
  warrantHistory: ArrestWarrant[];
  onUpdateWarrant: (id: string, status: WarrantStatus) => void;
}> = ({ warrantHistory, onUpdateWarrant }) => {
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterPericulosidade, setFilterPericulosidade] = useState('TODOS');
  const [filterSearch, setFilterSearch] = useState('');

  const filtered = warrantHistory.filter((w) => {
    const matchStatus = filterStatus === 'TODOS' || w.status === filterStatus;
    const matchPericulosidade =
      filterPericulosidade === 'TODOS' || w.periculosidade === filterPericulosidade;
    const matchSearch =
      w.nome.toLowerCase().includes(filterSearch.toLowerCase()) ||
      w.numero.toLowerCase().includes(filterSearch.toLowerCase());
    return matchStatus && matchPericulosidade && matchSearch;
  });

  return (
    <div>
      {/* Filters */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          padding: '10px 14px',
          marginBottom: 14,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase' }}>
          Filtros:
        </span>
        <input
          type="text"
          placeholder="Buscar por nome ou nº mandado…"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          style={{
            border: '1px solid #ccc',
            padding: '5px 10px',
            fontSize: 12,
            flex: 1,
            minWidth: 160,
            outline: 'none',
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ border: '1px solid #ccc', padding: '5px 8px', fontSize: 12, outline: 'none' }}
        >
          <option value="TODOS">TODOS OS STATUS</option>
          <option value="DEFERIDO">DEFERIDO</option>
          <option value="EM ANÁLISE">EM ANÁLISE</option>
          <option value="INDEFERIDO">INDEFERIDO</option>
          <option value="CUMPRIDO">CUMPRIDO</option>
        </select>
        <select
          value={filterPericulosidade}
          onChange={(e) => setFilterPericulosidade(e.target.value)}
          style={{ border: '1px solid #ccc', padding: '5px 8px', fontSize: 12, outline: 'none' }}
        >
          <option value="TODOS">TODA PERICULOSIDADE</option>
          <option value="BAIXO">BAIXO</option>
          <option value="MÉDIO">MÉDIO</option>
          <option value="ALTO">ALTO</option>
          <option value="EXTREMO">EXTREMO</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#1a3a6b' }}>
              {['Nº MANDADO', 'Nº PROCESSO', 'INVESTIGADO', 'TIPIFICAÇÃO', 'JUIZ RESPONSÁVEL', 'PERICULOSIDADE', 'STATUS', 'DATA PROTOCOLO', 'AÇÕES'].map(
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
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {[...filtered].reverse().map((w, i) => (
              <tr key={w.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8fa' }}>
                <td
                  style={{
                    padding: '6px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {w.numero}
                </td>
                <td
                  style={{
                    padding: '6px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: 9,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {w.processo}
                </td>
                <td
                  style={{
                    padding: '6px 10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: 600,
                    maxWidth: 150,
                  }}
                >
                  {w.nome}
                </td>
                <td
                  style={{
                    padding: '6px 10px',
                    borderBottom: '1px solid #eee',
                    maxWidth: 180,
                    fontSize: 10,
                  }}
                >
                  {w.tipificacao.slice(0, 40)}{w.tipificacao.length > 40 ? '…' : ''}
                </td>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid #eee', maxWidth: 140 }}>
                  {w.juiz}
                </td>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 9,
                      color:
                        w.periculosidade === 'EXTREMO'
                          ? '#8b0000'
                          : w.periculosidade === 'ALTO'
                          ? '#c04000'
                          : w.periculosidade === 'MÉDIO'
                          ? '#b37a00'
                          : '#1a7a1a',
                    }}
                  >
                    {w.periculosidade}
                  </span>
                </td>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  <StatusBadge status={w.status} />
                </td>
                <td
                  style={{
                    padding: '6px 10px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: 9,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatTimestamp(new Date(w.dataProtocolo))}
                </td>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  {w.status === 'DEFERIDO' && (
                    <button
                      onClick={() => onUpdateWarrant(w.id, 'CUMPRIDO')}
                      style={{
                        background: '#1a7a1a',
                        color: '#fff',
                        border: 'none',
                        padding: '3px 8px',
                        fontSize: 9,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      CUMPRIR
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 12 }}
                >
                  {warrantHistory.length === 0
                    ? 'Nenhum mandado protocolado nesta sessão.'
                    : 'Nenhum resultado encontrado com os filtros aplicados.'}
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
          {filtered.length} mandado(s) encontrado(s)
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Main Warrants Page ─────────────────── */
const WarrantsPage: React.FC<{
  warrantHistory: ArrestWarrant[];
  onAddWarrant: (w: ArrestWarrant) => void;
  onUpdateWarrant: (id: string, status: WarrantStatus) => void;
  onAddLog: (action: string, details: string, modulo: string) => void;
}> = ({ warrantHistory, onAddWarrant, onUpdateWarrant, onAddLog }) => {
  const [tab, setTab] = useState<WarrantTab>('arrest');

  const tabs: { key: WarrantTab; label: string }[] = [
    { key: 'arrest', label: '🔴 Mandado de Prisão' },
    { key: 'search', label: '🔍 Mandado de Busca e Apreensão' },
    { key: 'asset-seizure', label: '📦 Ordem de Apreensão de Bens' },
    { key: 'history', label: '📊 Histórico de Mandados' },
  ];

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
          marginBottom: 0,
          textTransform: 'uppercase',
          borderLeft: '4px solid #c8a730',
        }}
      >
        ⚖️ MÓDULO DE MANDADOS — GESTÃO E EXECUÇÃO
      </div>

      {/* Sub-tabs */}
      <div
        style={{
          display: 'flex',
          background: '#e8eaf0',
          borderBottom: '2px solid #1a3a6b',
          marginBottom: 20,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: tab === t.key ? '#1a3a6b' : 'transparent',
              color: tab === t.key ? '#fff' : '#555',
              fontSize: 12,
              fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer',
              borderRight: '1px solid #ccc',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #ccc', padding: 20 }}>
        {tab === 'arrest' && (
          <ArrestWarrantTab
            warrantHistory={warrantHistory}
            onAddWarrant={onAddWarrant}
            onUpdateWarrant={onUpdateWarrant}
            onAddLog={onAddLog}
          />
        )}
        {tab === 'search' && <SearchWarrantTab />}
        {tab === 'asset-seizure' && <AssetSeizureTab />}
        {tab === 'history' && (
          <WarrantHistoryTab
            warrantHistory={warrantHistory}
            onUpdateWarrant={onUpdateWarrant}
          />
        )}
      </div>
    </div>
  );
};

export default WarrantsPage;
