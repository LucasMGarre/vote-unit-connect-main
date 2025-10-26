export interface Room {
  id: string;
  nome: string;
  codigo: string;
  criadaEm: Date;
  status: 'aberta' | 'encerrada';
}

export interface Votation {
  id: string;
  salaId: string;
  pergunta: string;
  alternativas: string[];
  status: 'aberta' | 'encerrada';
  isAnonima: boolean;
  criadaEm: Date;
  encerradadaEm?: Date;
}

export interface Vote {
  id?: string;
  votacaoId: string;
  salaId: string;
  unidade: string;
  escolha: number;
  timestamp: Date;
  nomeVotante?: string;
}

export interface Participant {
  id?: string;
  salaId: string;
  unidade: string;
  bloco: string;
  apartamento: string;
  entradaEm: Date;
}
