-- Papéis de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios veem seus papeis" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Setores
CREATE TABLE public.setores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.setores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.setores TO authenticated;
GRANT ALL ON public.setores TO service_role;
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Setores visiveis para todos" ON public.setores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins gerenciam setores" ON public.setores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER setores_updated_at BEFORE UPDATE ON public.setores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Obras
CREATE TABLE public.obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.obras TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras TO authenticated;
GRANT ALL ON public.obras TO service_role;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Obras visiveis para todos" ON public.obras FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins gerenciam obras" ON public.obras FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER obras_updated_at BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indicadores
CREATE TABLE public.indicadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setor_id uuid NOT NULL REFERENCES public.setores(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (setor_id, nome)
);
GRANT SELECT ON public.indicadores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.indicadores TO authenticated;
GRANT ALL ON public.indicadores TO service_role;
ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Indicadores visiveis para todos" ON public.indicadores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins gerenciam indicadores" ON public.indicadores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER indicadores_updated_at BEFORE UPDATE ON public.indicadores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Opções de listas (status do indicador, status do resultado, evidência)
CREATE TABLE public.opcoes_lista (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  valor text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tipo, valor)
);
GRANT SELECT ON public.opcoes_lista TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opcoes_lista TO authenticated;
GRANT ALL ON public.opcoes_lista TO service_role;
ALTER TABLE public.opcoes_lista ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opcoes visiveis para todos" ON public.opcoes_lista FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins gerenciam opcoes" ON public.opcoes_lista FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER opcoes_lista_updated_at BEFORE UPDATE ON public.opcoes_lista FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Configurações gerais (ex.: quantidade de meses retroativos disponíveis)
CREATE TABLE public.configuracoes (
  chave text PRIMARY KEY,
  valor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.configuracoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Configuracoes visiveis para todos" ON public.configuracoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins gerenciam configuracoes" ON public.configuracoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER configuracoes_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.configuracoes (chave, valor) VALUES ('meses_retroativos', '2');

INSERT INTO public.setores (nome, ordem) VALUES
('Administrativo', 0),
('Administrativo RMT', 1),
('Custos', 2),
('Custos RMT', 3),
('Departamento Pessoal', 4),
('Equipamentos', 5),
('Gestão de Obra', 6),
('Gestão de Obra RMT', 7),
('Meio Ambiente', 8),
('Meio Ambiente RMT', 9),
('Planejamento', 10),
('Planejamento RMT', 11),
('Produção', 12),
('Produção RMT', 13),
('Projetos', 14),
('Qualidade', 15),
('Qualidade RMT', 16),
('Recursos Humanos', 17),
('Sala Técnica', 18),
('Sala Técnica RMT', 19),
('SSO', 20),
('SSO RMT', 21);
INSERT INTO public.obras (nome, ordem) VALUES
('Dom Inocêncio IV | Sul - Civil', 0),
('Dom Inocêncio IV | Sul - RMT', 1),
('Esquina do Vento', 2),
('Sede Cortez', 3);
INSERT INTO public.indicadores (setor_id, nome, ordem) VALUES
((SELECT id FROM public.setores WHERE nome = 'Administrativo'), 'Custo per Capita com Alimentação', 0),
((SELECT id FROM public.setores WHERE nome = 'Administrativo'), 'Custo per Capita com Alojamento', 1),
((SELECT id FROM public.setores WHERE nome = 'Administrativo'), 'Custo per Capita com Transporte', 2),
((SELECT id FROM public.setores WHERE nome = 'Administrativo'), 'Índice de Acurácia do Estoque', 3),
((SELECT id FROM public.setores WHERE nome = 'Administrativo'), 'Índice de Notas Fiscais de Faturamento Cortez Fora do Sistema', 4),
((SELECT id FROM public.setores WHERE nome = 'Administrativo RMT'), 'Índice de Acurácia do Estoque', 0),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Aderência ao Histograma de Equipamentos de Apoio (Grande Porte)', 0),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Aderência ao Histograma de Equipamentos de Apoio (Médio, Pequeno e Ferramental)', 1),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Aderência ao Histograma de Linha Amarela', 2),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Aderência ao Histograma de Linha Branca', 3),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Aderência ao Histograma de Mão de Obra', 4),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Aderência ao Histograma de Veículos', 5),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Aderência ao Orçamento Executivo Dinâmico ao Orçamento Executivo Aprovado', 6),
((SELECT id FROM public.setores WHERE nome = 'Custos'), 'Avaliação das Rotinas de Custos', 7),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Aderência ao Histograma de Equipamentos de Apoio (Grande Porte)', 0),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Aderência ao Histograma de Equipamentos de Apoio (Médio, Pequeno e Ferramental)', 1),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Aderência ao Histograma de Linha Amarela', 2),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Aderência ao Histograma de Linha Branca', 3),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Aderência ao Histograma de Mão de Obra', 4),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Aderência ao Histograma de Veículos', 5),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Aderência ao Orçamento Executivo Dinâmico ao Orçamento Executivo Aprovado', 6),
((SELECT id FROM public.setores WHERE nome = 'Custos RMT'), 'Avaliação das Rotinas de Custos', 7),
((SELECT id FROM public.setores WHERE nome = 'Departamento Pessoal'), 'Ações Trabalhistas - Cortez', 0),
((SELECT id FROM public.setores WHERE nome = 'Departamento Pessoal'), 'Ações Trabalhistas de Terceiros Cortez', 1),
((SELECT id FROM public.setores WHERE nome = 'Departamento Pessoal'), 'Dias Úteis para Contratação de Mão de Obra', 2),
((SELECT id FROM public.setores WHERE nome = 'Departamento Pessoal'), 'Entrega do Relatório de Mão de Obra dentro do Prazo Estabelecido', 3),
((SELECT id FROM public.setores WHERE nome = 'Equipamentos'), 'Disponibilidade Mecânica da Linha Amarela Principal', 0),
((SELECT id FROM public.setores WHERE nome = 'Equipamentos'), 'Disponibilidade Mecânica da Linha Branca Principal', 1),
((SELECT id FROM public.setores WHERE nome = 'Equipamentos'), 'Lubrificação de Equipamentos', 2),
((SELECT id FROM public.setores WHERE nome = 'Equipamentos'), 'Fechamento das Medições dos Fornecedores de Locação dentro do Prazo Estabelecido', 3),
((SELECT id FROM public.setores WHERE nome = 'Equipamentos'), 'Lançamento das Medições dos Locadores no Informakon dentro do Prazo Estabelecido', 4),
((SELECT id FROM public.setores WHERE nome = 'Gestão de Obra'), 'Índice de Custos', 0),
((SELECT id FROM public.setores WHERE nome = 'Gestão de Obra RMT'), 'Índice de Custos', 0),
((SELECT id FROM public.setores WHERE nome = 'Meio Ambiente'), 'Atendimento das Condicionantes das Licenças Ambientais Emitidas para Cortez', 0),
((SELECT id FROM public.setores WHERE nome = 'Meio Ambiente'), 'Conformidade de Atendimento aos Requisitos Contratuais Ambientais', 1),
((SELECT id FROM public.setores WHERE nome = 'Meio Ambiente'), 'Inspeções de Meio Ambiente', 2),
((SELECT id FROM public.setores WHERE nome = 'Meio Ambiente'), 'Quantidade de Ocorrências Ambientais', 3),
((SELECT id FROM public.setores WHERE nome = 'Meio Ambiente RMT'), 'Quantidade de Ocorrências Ambientais', 0),
((SELECT id FROM public.setores WHERE nome = 'Planejamento'), 'Avaliação das Rotinas de Planejamento', 0),
((SELECT id FROM public.setores WHERE nome = 'Planejamento'), 'Índice de Prazo do Cronograma Cortez', 1),
((SELECT id FROM public.setores WHERE nome = 'Planejamento'), 'Índice de Remoção de Restrições do Médio Prazo', 2),
((SELECT id FROM public.setores WHERE nome = 'Planejamento'), 'Índice de Remoção de Restrições do Check-In/Check-Out', 3),
((SELECT id FROM public.setores WHERE nome = 'Planejamento RMT'), 'Avaliação das Rotinas de Planejamento', 0),
((SELECT id FROM public.setores WHERE nome = 'Planejamento RMT'), 'Índice de Prazo do Cronograma Cortez', 1),
((SELECT id FROM public.setores WHERE nome = 'Planejamento RMT'), 'Índice de Remoção de Restrições do Médio Prazo', 2),
((SELECT id FROM public.setores WHERE nome = 'Planejamento RMT'), 'Índice de Remoção de Restrições do Check-In/Check-Out', 3),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Custo de Horas Extras sobre Custo de Folha', 0),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Eficiência Operacional da Linha Amarela Principal', 1),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Eficiência Operacional da Linha Branca Principal', 2),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Eficiência das Medições de Equipamentos', 3),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Ineficiência de Medição de Equipamentos por Não Utilização', 4),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Ineficiência de Medição de Equipamentos por Horas Excedentes', 5),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Ineficiência de Medição de Equipamentos por Avarias', 6),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Taxa de Utilização da Linha Amarela Principal', 7),
((SELECT id FROM public.setores WHERE nome = 'Produção'), 'Taxa de Utilização da Linha Branca Principal', 8),
((SELECT id FROM public.setores WHERE nome = 'Produção RMT'), 'Custo de Horas Extras sobre Custo de Folha', 0),
((SELECT id FROM public.setores WHERE nome = 'Produção RMT'), 'Eficiência Operacional da Linha Amarela Principal', 1),
((SELECT id FROM public.setores WHERE nome = 'Produção RMT'), 'Eficiência Operacional da Linha Branca Principal', 2),
((SELECT id FROM public.setores WHERE nome = 'Produção RMT'), 'Eficiência das Medições de Equipamentos', 3),
((SELECT id FROM public.setores WHERE nome = 'Produção RMT'), 'Taxa de Utilização da Linha Amarela Principal', 4),
((SELECT id FROM public.setores WHERE nome = 'Produção RMT'), 'Taxa de Utilização da Linha Branca Principal', 5),
((SELECT id FROM public.setores WHERE nome = 'Projetos'), 'Atendimento dos Quantitativos Orçados de Projetos Civis (Fundações e Edificações) em comparação aos Quantitativos de Contrato (projeto executivo)', 0),
((SELECT id FROM public.setores WHERE nome = 'Projetos'), 'Atendimento dos Quantitativos Orçados de Projetos Viários (Vias e Plataformas) em comparação aos Quantitativos de Contrato (projeto executivo)', 1),
((SELECT id FROM public.setores WHERE nome = 'Projetos'), 'Atendimento dos Quantitativos Orçados de Projetos de RMT, em comparação aos Quantitativos de Contrato (projeto executivo)', 2),
((SELECT id FROM public.setores WHERE nome = 'Qualidade'), 'Atendimento aos Prazos dos Itens Acordados em Atas de Reuniões com o Cliente', 0),
((SELECT id FROM public.setores WHERE nome = 'Qualidade'), 'Conformidade das inspeções de serviços', 1),
((SELECT id FROM public.setores WHERE nome = 'Qualidade'), 'Índice de Ensaios Realizados', 2),
((SELECT id FROM public.setores WHERE nome = 'Qualidade'), 'Índice de Satisfação dos Clientes', 3),
((SELECT id FROM public.setores WHERE nome = 'Qualidade'), 'Não Conformidades Encerradas com Eficácia', 4),
((SELECT id FROM public.setores WHERE nome = 'Qualidade'), 'Reclamações Emitidas pelo Cliente', 5),
((SELECT id FROM public.setores WHERE nome = 'Qualidade RMT'), 'Conformidade das inspeções de serviços', 0),
((SELECT id FROM public.setores WHERE nome = 'Qualidade RMT'), 'Reclamações Emitidas pelo Cliente', 1),
((SELECT id FROM public.setores WHERE nome = 'Recursos Humanos'), 'Satisfação dos Colaboradores', 0),
((SELECT id FROM public.setores WHERE nome = 'Recursos Humanos'), 'Tempo Médio de Seleção', 1),
((SELECT id FROM public.setores WHERE nome = 'Recursos Humanos'), 'Absenteísmo', 2),
((SELECT id FROM public.setores WHERE nome = 'Recursos Humanos'), 'Horas/Homem Treinamento de Lideranças', 3),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Aprovação do Cliente para Faturamento Cortez dentro do Prazo Estabelecido', 0),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Atendimento Fiscal das Responsabilidades da Contratante', 1),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Envio do DRE dentro do Prazo Estabelecido', 2),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Envio da Medição ao Cliente dentro do Prazo Estabelecido', 3),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Índice de Notas Fiscais de Faturamento Direto dentro do Sistema', 4),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Projetos de Fundações Emitidos Dentro do Prazo', 5),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Projetos de Fundações Aprovados Dentro do Prazo', 6),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Projetos de Edificações Emitidos Dentro do Prazo', 7),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Projetos de Edificações Aprovados Dentro do Prazo', 8),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Projetos Viários Emitidos Dentro do Prazo', 9),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica'), 'Projetos Viários Aprovados Dentro do Prazo', 10),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica RMT'), 'Aprovação do Cliente para Faturamento Cortez dentro do Prazo Estabelecido', 0),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica RMT'), 'Atendimento Fiscal das Responsabilidades da Contratante', 1),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica RMT'), 'Envio do DRE dentro do Prazo Estabelecido', 2),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica RMT'), 'Envio da Medição ao Cliente dentro do Prazo Estabelecido', 3),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica RMT'), 'Projetos de RMT Emitidos Dentro do Prazo', 4),
((SELECT id FROM public.setores WHERE nome = 'Sala Técnica RMT'), 'Projetos de RMT Aprovados Dentro do Prazo', 5),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Atendimento aos requisitos legais de Segurança do Trabalho e Meio Ambiente', 0),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Conformidade de Atendimento aos Requisitos Contratuais de SSO', 1),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Inspeções de SSO', 2),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Horas Homem Treinadas por Horas Homem Trabalhadas', 3),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Número de Dias de Afastamento por Doenças Ocupacionais (Doença Profissional)', 4),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Taxa de Frequência de Acidentes com Afastamento', 5),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Taxa de Frequência de Acidentes sem Afastamento', 6),
((SELECT id FROM public.setores WHERE nome = 'SSO'), 'Taxa de Gravidade', 7),
((SELECT id FROM public.setores WHERE nome = 'SSO RMT'), 'Número de Dias de Afastamento por Doenças Ocupacionais (Doença Profissional)', 0),
((SELECT id FROM public.setores WHERE nome = 'SSO RMT'), 'Taxa de Frequência de Acidentes com Afastamento', 1),
((SELECT id FROM public.setores WHERE nome = 'SSO RMT'), 'Taxa de Frequência de Acidentes sem Afastamento', 2),
((SELECT id FROM public.setores WHERE nome = 'SSO RMT'), 'Taxa de Gravidade', 3);
INSERT INTO public.opcoes_lista (tipo, valor, ordem) VALUES
('status_indicador', 'Realizado | Medido', 0),
('status_indicador', 'Não Iniciado', 1),
('status_indicador', 'Não Aplicável', 2),
('status_indicador', 'Encerrado', 3),
('status_resultado', 'Alcançada', 0),
('status_resultado', 'Em Alerta', 1),
('status_resultado', 'Não Alcançada', 2),
('evidencia', 'Sim', 0),
('evidencia', 'Não', 1),
('evidencia', 'Não é necessário o envio da evidência', 2);