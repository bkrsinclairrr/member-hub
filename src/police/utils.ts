import type { Periculosidade, WarrantStatus } from './types';

export function generateWarrantNumber(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 90000000) + 10000000);
  return `MP-${year}-${num}`;
}

export function generateProcessNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000000) + 1000000).padStart(7, '0');
  const check = String(Math.floor(Math.random() * 90) + 10);
  const vara = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
  return `${seq}-${check}.${year}.8.26.${vara}`;
}

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function computeDecision(
  periculosidade: Periculosidade,
  fundamentacao: string,
): WarrantStatus {
  const fundLen = fundamentacao.trim().length;
  const roll = Math.random();

  if (fundLen < 50) {
    return roll < 0.65 ? 'INDEFERIDO' : 'EM ANÁLISE';
  }

  // [DEFERIDO threshold, EM ANÁLISE cumulative threshold]
  const weights: Record<Periculosidade, [number, number]> = {
    BAIXO: [0.2, 0.55],
    MÉDIO: [0.45, 0.75],
    ALTO: [0.65, 0.88],
    EXTREMO: [0.8, 0.95],
  };

  const [d, da] = weights[periculosidade];
  if (roll < d) return 'DEFERIDO';
  if (roll < da) return 'EM ANÁLISE';
  return 'INDEFERIDO';
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '–';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function generateLegalText(warrant: {
  processo: string;
  tipificacao: string;
  nome: string;
  cpf: string;
  periculosidade: Periculosidade;
  endereco: string;
  pai: string;
  mae: string;
  nacionalidade: string;
}): string {
  return `Diante dos elementos constantes nos autos do processo nº ${warrant.processo}, nos quais restaram apuradas infrações penais tipificadas nos termos do ${warrant.tipificacao}, praticadas pelo investigado ${warrant.nome}, portador do CPF nº ${warrant.cpf}, nos termos da representação formulada pela Autoridade Policial.

Considerando a necessidade de garantia da ordem pública, o risco concreto de reiteração criminosa, a conveniência da instrução criminal e a necessidade de assegurar a aplicação da lei penal, conforme devidamente demonstrado nos autos.

Considerando que o investigado apresenta grau de periculosidade classificado como ${warrant.periculosidade}, representando risco substancial à segurança da coletividade e ao regular andamento do processo, nos termos do artigo 312 do Código de Processo Penal.

Considerando que a medida cautelar diversa da prisão se mostra insuficiente e inadequada no caso concreto, tendo em vista a gravidade do delito imputado e as circunstâncias que o envolvem, em conformidade com o disposto no artigo 282, §6º do Código de Processo Penal.

Tendo em vista os fundamentos legais estabelecidos nos arts. 311 a 316 do Código de Processo Penal, bem como a presença dos requisitos do art. 312 do CPP, que autorizam a decretação da prisão preventiva, e o parecer favorável do Ministério Público.

DECIDO: DEFERIR o pedido de prisão preventiva formulado pela Autoridade Policial, nos termos da representação de fls., que, por seus próprios fundamentos, passa a fazer parte integrante desta decisão.

Expeça-se MANDADO DE PRISÃO em desfavor do investigado ${warrant.nome}, ${warrant.nacionalidade}, residente e domiciliado no endereço: ${warrant.endereco}, filho de ${warrant.pai} e ${warrant.mae}.

Após o cumprimento, apresente-se o preso à Autoridade Policial competente para lavratura do auto de prisão em flagrante ou de cumprimento de mandado, nos termos da legislação vigente.

Comunique-se ao IIRGD, ao Sistema de Informações de Mandados (SIM), ao Instituto de Identificação "Ricardo Gumbleton Daunt" e ao Sistema Nacional de Informações de Segurança Pública (SINESP).

Publique-se. Intime-se. Cumpra-se.`;
}
