export type Page =
  | 'dashboard'
  | 'individuals'
  | 'vehicles'
  | 'warrants'
  | 'seizures'
  | 'assets'
  | 'monitoring'
  | 'logs';

export type WarrantTab = 'arrest' | 'search' | 'asset-seizure' | 'history';

export type WarrantStatus = 'DEFERIDO' | 'EM ANÁLISE' | 'INDEFERIDO' | 'CUMPRIDO';

export type Periculosidade = 'BAIXO' | 'MÉDIO' | 'ALTO' | 'EXTREMO';

export type ProcessingState =
  | null
  | 'step1'
  | 'step2'
  | 'step3'
  | 'deciding'
  | 'result'
  | 'document';

export interface ArrestWarrantFormData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  pai: string;
  mae: string;
  nacionalidade: string;
  endereco: string;
  tipificacao: string;
  descricaoConduta: string;
  fundamentacao: string;
  criterios: string[];
  juiz: string;
  vara: string;
  dataDecisao: string;
  periculosidade: Periculosidade;
}

export interface ArrestWarrant extends ArrestWarrantFormData {
  id: string;
  numero: string;
  processo: string;
  delegado: string;
  status: WarrantStatus;
  dataProtocolo: string;
}

export interface SearchWarrant {
  id: string;
  numero: string;
  processo: string;
  alvo: string;
  endereco: string;
  motivo: string;
  juiz: string;
  vara: string;
  status: WarrantStatus;
  dataProtocolo: string;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  modulo: string;
  user: string;
}
