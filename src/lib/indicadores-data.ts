/**
 * Retorna os períodos disponíveis para lançamento: os dois meses anteriores
 * e o mês atual, do mais antigo para o mais recente (esquerda → direita).
 * Ex.: em setembro/2026 retorna ["2026-07", "2026-08", "2026-09"].
 */
export function periodosDisponiveis(): string[] {
  const agora = new Date();
  const periodos: string[] = [];
  for (let i = 2; i >= 0; i--) {
    const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    periodos.push(`${ano}-${mes}`);
  }
  return periodos;
}

export const PROJETOS = [
  "Dom Inocêncio IV | Sul - Civil",
  "Dom Inocêncio IV | Sul - RMT",
  "Esquina do Vento",
  "Sede Cortez",
] as const;

export const RESPONSAVEIS_INDICADORES: Record<string, string[]> = {
  Administrativo: [
    "Custo per Capita com Alimentação",
    "Custo per Capita com Alojamento",
    "Custo per Capita com Transporte",
    "Índice de Acurácia do Estoque",
    "Índice de Notas Fiscais de Faturamento Cortez Fora do Sistema",
  ],
  "Administrativo RMT": ["Índice de Acurácia do Estoque"],
  Custos: [
    "Aderência ao Histograma de Equipamentos de Apoio (Grande Porte)",
    "Aderência ao Histograma de Equipamentos de Apoio (Médio, Pequeno e Ferramental)",
    "Aderência ao Histograma de Linha Amarela",
    "Aderência ao Histograma de Linha Branca",
    "Aderência ao Histograma de Mão de Obra",
    "Aderência ao Histograma de Veículos",
    "Aderência ao Orçamento Executivo Dinâmico ao Orçamento Executivo Aprovado",
    "Avaliação das Rotinas de Custos",
  ],
  "Custos RMT": [
    "Aderência ao Histograma de Equipamentos de Apoio (Grande Porte)",
    "Aderência ao Histograma de Equipamentos de Apoio (Médio, Pequeno e Ferramental)",
    "Aderência ao Histograma de Linha Amarela",
    "Aderência ao Histograma de Linha Branca",
    "Aderência ao Histograma de Mão de Obra",
    "Aderência ao Histograma de Veículos",
    "Aderência ao Orçamento Executivo Dinâmico ao Orçamento Executivo Aprovado",
    "Avaliação das Rotinas de Custos",
  ],
  "Departamento Pessoal": [
    "Ações Trabalhistas - Cortez",
    "Ações Trabalhistas de Terceiros Cortez",
    "Dias Úteis para Contratação de Mão de Obra",
    "Entrega do Relatório de Mão de Obra dentro do Prazo Estabelecido",
  ],
  Equipamentos: [
    "Disponibilidade Mecânica da Linha Amarela Principal",
    "Disponibilidade Mecânica da Linha Branca Principal",
    "Lubrificação de Equipamentos",
    "Fechamento das Medições dos Fornecedores de Locação dentro do Prazo Estabelecido",
    "Lançamento das Medições dos Locadores no Informakon dentro do Prazo Estabelecido",
  ],
  "Gestão de Obra": ["Índice de Custos"],
  "Gestão de Obra RMT": ["Índice de Custos"],
  "Meio Ambiente": [
    "Atendimento das Condicionantes das Licenças Ambientais Emitidas para Cortez",
    "Conformidade de Atendimento aos Requisitos Contratuais Ambientais",
    "Inspeções de Meio Ambiente",
    "Quantidade de Ocorrências Ambientais",
  ],
  "Meio Ambiente RMT": ["Quantidade de Ocorrências Ambientais"],
  Planejamento: [
    "Avaliação das Rotinas de Planejamento",
    "Índice de Prazo do Cronograma Cortez",
    "Índice de Remoção de Restrições do Médio Prazo",
    "Índice de Remoção de Restrições do Check-In/Check-Out",
  ],
  "Planejamento RMT": [
    "Avaliação das Rotinas de Planejamento",
    "Índice de Prazo do Cronograma Cortez",
    "Índice de Remoção de Restrições do Médio Prazo",
    "Índice de Remoção de Restrições do Check-In/Check-Out",
  ],
  Produção: [
    "Custo de Horas Extras sobre Custo de Folha",
    "Eficiência Operacional da Linha Amarela Principal",
    "Eficiência Operacional da Linha Branca Principal",
    "Eficiência das Medições de Equipamentos",
    "Ineficiência de Medição de Equipamentos por Não Utilização",
    "Ineficiência de Medição de Equipamentos por Horas Excedentes",
    "Ineficiência de Medição de Equipamentos por Avarias",
    "Taxa de Utilização da Linha Amarela Principal",
    "Taxa de Utilização da Linha Branca Principal",
  ],
  "Produção RMT": [
    "Custo de Horas Extras sobre Custo de Folha",
    "Eficiência Operacional da Linha Amarela Principal",
    "Eficiência Operacional da Linha Branca Principal",
    "Eficiência das Medições de Equipamentos",
    "Taxa de Utilização da Linha Amarela Principal",
    "Taxa de Utilização da Linha Branca Principal",
  ],
  Projetos: [
    "Atendimento dos Quantitativos Orçados de Projetos Civis (Fundações e Edificações) em comparação aos Quantitativos de Contrato (projeto executivo)",
    "Atendimento dos Quantitativos Orçados de Projetos Viários (Vias e Plataformas) em comparação aos Quantitativos de Contrato (projeto executivo)",
    "Atendimento dos Quantitativos Orçados de Projetos de RMT, em comparação aos Quantitativos de Contrato (projeto executivo)",
  ],
  Qualidade: [
    "Atendimento aos Prazos dos Itens Acordados em Atas de Reuniões com o Cliente",
    "Conformidade das inspeções de serviços",
    "Índice de Ensaios Realizados",
    "Índice de Satisfação dos Clientes",
    "Não Conformidades Encerradas com Eficácia",
    "Reclamações Emitidas pelo Cliente",
  ],
  "Qualidade RMT": [
    "Conformidade das inspeções de serviços",
    "Reclamações Emitidas pelo Cliente",
  ],
  "Recursos Humanos": [
    "Satisfação dos Colaboradores",
    "Tempo Médio de Seleção",
    "Absenteísmo",
    "Horas/Homem Treinamento de Lideranças",
  ],
  "Sala Técnica": [
    "Aprovação do Cliente para Faturamento Cortez dentro do Prazo Estabelecido",
    "Atendimento Fiscal das Responsabilidades da Contratante",
    "Envio do DRE dentro do Prazo Estabelecido",
    "Envio da Medição ao Cliente dentro do Prazo Estabelecido",
    "Índice de Notas Fiscais de Faturamento Direto dentro do Sistema",
    "Projetos de Fundações Emitidos Dentro do Prazo",
    "Projetos de Fundações Aprovados Dentro do Prazo",
    "Projetos de Edificações Emitidos Dentro do Prazo",
    "Projetos de Edificações Aprovados Dentro do Prazo",
    "Projetos Viários Emitidos Dentro do Prazo",
    "Projetos Viários Aprovados Dentro do Prazo",
  ],
  "Sala Técnica RMT": [
    "Aprovação do Cliente para Faturamento Cortez dentro do Prazo Estabelecido",
    "Atendimento Fiscal das Responsabilidades da Contratante",
    "Envio do DRE dentro do Prazo Estabelecido",
    "Envio da Medição ao Cliente dentro do Prazo Estabelecido",
    "Projetos de RMT Emitidos Dentro do Prazo",
    "Projetos de RMT Aprovados Dentro do Prazo",
  ],
  SSO: [
    "Atendimento aos requisitos legais de Segurança do Trabalho e Meio Ambiente",
    "Conformidade de Atendimento aos Requisitos Contratuais de SSO",
    "Inspeções de SSO",
    "Horas Homem Treinadas por Horas Homem Trabalhadas",
    "Número de Dias de Afastamento por Doenças Ocupacionais (Doença Profissional)",
    "Taxa de Frequência de Acidentes com Afastamento",
    "Taxa de Frequência de Acidentes sem Afastamento",
    "Taxa de Gravidade",
  ],
  "SSO RMT": [
    "Número de Dias de Afastamento por Doenças Ocupacionais (Doença Profissional)",
    "Taxa de Frequência de Acidentes com Afastamento",
    "Taxa de Frequência de Acidentes sem Afastamento",
    "Taxa de Gravidade",
  ],
};

export const RESPONSAVEIS = Object.keys(RESPONSAVEIS_INDICADORES);

export const STATUS_INDICADOR = [
  "Realizado | Medido",
  "Não Iniciado",
  "Não Aplicável",
  "Encerrado",
] as const;

export const STATUS_RESULTADO = [
  "Alcançada",
  "Em Alerta",
  "Não Alcançada",
] as const;

export const EVIDENCIA_OPCOES = [
  "Sim",
  "Não",
  "Não é necessário o envio da evidência",
] as const;

const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function rotuloPeriodo(periodo: string): string {
  const [ano, mes] = periodo.split("-");
  const indice = Number(mes) - 1;
  return `${ano} · ${MESES[indice] ?? mes}`;
}
