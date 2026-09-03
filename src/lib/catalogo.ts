import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Setor = { id: string; nome: string; ordem: number; ativo: boolean };
export type Obra = { id: string; nome: string; ordem: number; ativo: boolean };
export type Indicador = {
  id: string;
  setor_id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
};
export type OpcaoLista = {
  id: string;
  tipo: string;
  valor: string;
  ordem: number;
  ativo: boolean;
};

export const TIPOS_OPCAO = [
  { tipo: "status_indicador", rotulo: "Status do indicador" },
  { tipo: "status_resultado", rotulo: "Status do resultado" },
  { tipo: "evidencia", rotulo: "Evidência" },
] as const;

async function listarSetores(): Promise<Setor[]> {
  const { data, error } = await supabase
    .from("setores")
    .select("id, nome, ordem, ativo")
    .order("ordem")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

async function listarObras(): Promise<Obra[]> {
  const { data, error } = await supabase
    .from("obras")
    .select("id, nome, ordem, ativo")
    .order("ordem")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

async function listarIndicadores(): Promise<Indicador[]> {
  const { data, error } = await supabase
    .from("indicadores")
    .select("id, setor_id, nome, ordem, ativo")
    .order("ordem")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

async function listarOpcoes(): Promise<OpcaoLista[]> {
  const { data, error } = await supabase
    .from("opcoes_lista")
    .select("id, tipo, valor, ordem, ativo")
    .order("ordem")
    .order("valor");
  if (error) throw error;
  return data ?? [];
}

async function lerMesesRetroativos(): Promise<number> {
  const { data, error } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "meses_retroativos")
    .maybeSingle();
  if (error) throw error;
  const n = Number(data?.valor ?? 2);
  return Number.isFinite(n) && n >= 0 && n <= 11 ? n : 2;
}

export function useSetores() {
  return useQuery({ queryKey: ["setores"], queryFn: listarSetores });
}
export function useObras() {
  return useQuery({ queryKey: ["obras"], queryFn: listarObras });
}
export function useIndicadores() {
  return useQuery({ queryKey: ["indicadores"], queryFn: listarIndicadores });
}
export function useOpcoes() {
  return useQuery({ queryKey: ["opcoes_lista"], queryFn: listarOpcoes });
}
export function useMesesRetroativos() {
  return useQuery({
    queryKey: ["configuracoes", "meses_retroativos"],
    queryFn: lerMesesRetroativos,
  });
}

export function opcoesAtivas(opcoes: OpcaoLista[] | undefined, tipo: string) {
  return (opcoes ?? []).filter((o) => o.ativo && o.tipo === tipo).map((o) => o.valor);
}
