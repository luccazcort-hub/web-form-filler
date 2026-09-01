CREATE TABLE public.lancamentos_indicadores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  periodo TEXT NOT NULL,
  projeto TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  indicador TEXT NOT NULL,
  status_indicador TEXT NOT NULL,
  resultado NUMERIC,
  status_resultado TEXT,
  parecer TEXT,
  plano_acao TEXT,
  evidencia TEXT NOT NULL
);
GRANT INSERT ON public.lancamentos_indicadores TO anon;
GRANT SELECT ON public.lancamentos_indicadores TO authenticated;
GRANT ALL ON public.lancamentos_indicadores TO service_role;
ALTER TABLE public.lancamentos_indicadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer pessoa pode criar lancamento" ON public.lancamentos_indicadores FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados podem consultar" ON public.lancamentos_indicadores FOR SELECT TO authenticated USING (true);