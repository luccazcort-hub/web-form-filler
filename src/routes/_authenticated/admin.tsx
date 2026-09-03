import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  TIPOS_OPCAO,
  useIndicadores,
  useMesesRetroativos,
  useObras,
  useOpcoes,
  useSetores,
  type Indicador,
} from "@/lib/catalogo";
import { periodosDisponiveis, rotuloPeriodo } from "@/lib/indicadores-data";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Administração de indicadores | Cortez Engenharia" },
      {
        name: "description",
        content:
          "Painel administrativo para cadastrar obras, setores, indicadores e opções do formulário de indicadores Cortez.",
      },
      { property: "og:title", content: "Administração de indicadores | Cortez Engenharia" },
      {
        property: "og:description",
        content: "Cadastre obras, setores e indicadores e inative os que não estão mais em uso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const inputCls =
  "w-full rounded-[10px] bg-paper px-3.5 py-2.5 text-sm text-ink ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand/40";

const ABAS = [
  { id: "obras", rotulo: "Obras" },
  { id: "setores", rotulo: "Setores" },
  { id: "indicadores", rotulo: "Indicadores" },
  { id: "opcoes", rotulo: "Listas de status" },
  { id: "periodo", rotulo: "Período" },
] as const;

type Aba = (typeof ABAS)[number]["id"];

function useIsAdmin() {
  return useQuery({
    queryKey: ["is_admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aba, setAba] = useState<Aba>("obras");
  const { data: isAdmin, isLoading } = useIsAdmin();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen font-sans text-ink antialiased">
      <header className="border-b border-line/80 bg-paper/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[10px] bg-brand font-mono text-sm font-medium text-paper">
              CZ
            </div>
            <div className="leading-none">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
                Cortez Engenharia
              </p>
              <p className="mt-1 text-sm font-medium">Administração de indicadores</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-brand-2 hover:text-brand">
              Formulário
            </Link>
            <button
              type="button"
              onClick={sair}
              className="rounded-[10px] bg-surface px-3.5 py-2 text-sm font-medium text-ink ring-1 ring-line hover:bg-paper"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        {isLoading && <p className="text-sm text-ink/60">Carregando permissões...</p>}

        {!isLoading && !isAdmin && (
          <div className="rounded-[18px] bg-paper p-6 ring-1 ring-black/5">
            <h1 className="text-xl font-semibold">Acesso não autorizado</h1>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink/70">
              Sua conta está autenticada, mas não possui o papel de administrador. Peça a um
              administrador para liberar seu acesso.
            </p>
          </div>
        )}

        {!isLoading && isAdmin && (
          <>
            <nav className="flex flex-wrap gap-2">
              {ABAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAba(a.id)}
                  className={
                    aba === a.id
                      ? "rounded-full bg-brand px-4 py-2 text-sm font-medium text-paper"
                      : "rounded-full bg-paper px-4 py-2 text-sm text-ink/70 ring-1 ring-line hover:bg-surface"
                  }
                >
                  {a.rotulo}
                </button>
              ))}
            </nav>

            <div className="mt-6 rounded-[18px] bg-paper p-6 ring-1 ring-black/5">
              {aba === "obras" && <Obras />}
              {aba === "setores" && <Setores />}
              {aba === "indicadores" && <Indicadores />}
              {aba === "opcoes" && <Opcoes />}
              {aba === "periodo" && <Periodo />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Titulo({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-ink/60">{descricao}</p>
    </div>
  );
}

function LinhaItem({
  nome,
  ativo,
  onToggle,
  extra,
}: {
  nome: string;
  ativo: boolean;
  onToggle: () => void;
  extra?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-[10px] bg-surface px-4 py-3 ring-1 ring-line">
      <span className="text-sm">
        <span className={ativo ? "text-ink" : "text-ink/45 line-through"}>{nome}</span>
        {extra && <span className="ml-2 font-mono text-[11px] text-ink/45">{extra}</span>}
      </span>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={
            ativo
              ? "rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-2"
              : "rounded-full bg-ink/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/50"
          }
        >
          {ativo ? "Ativo" : "Inativo"}
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-[10px] bg-paper px-3 py-1.5 text-sm font-medium text-brand-2 ring-1 ring-line hover:bg-surface"
        >
          {ativo ? "Inativar" : "Reativar"}
        </button>
      </div>
    </li>
  );
}

function useRecarregar() {
  const queryClient = useQueryClient();
  return (chave: string) => queryClient.invalidateQueries({ queryKey: [chave] });
}

function Obras() {
  const { data, isLoading } = useObras();
  const recarregar = useRecarregar();
  const [nome, setNome] = useState("");

  async function adicionar() {
    if (!nome.trim()) return;
    const { error } = await supabase
      .from("obras")
      .insert({ nome: nome.trim(), ordem: (data?.length ?? 0) + 1 });
    if (error) {
      toast.error("Não foi possível adicionar a obra.");
      return;
    }
    setNome("");
    toast.success("Obra adicionada.");
    recarregar("obras");
  }

  async function alternar(id: string, ativo: boolean) {
    const { error } = await supabase.from("obras").update({ ativo: !ativo }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar a obra.");
      return;
    }
    toast.success(ativo ? "Obra inativada." : "Obra reativada.");
    recarregar("obras");
  }

  return (
    <div>
      <Titulo
        titulo="Obras"
        descricao="Cadastre novas obras e inative as concluídas. Obras inativas somem do formulário, mas os lançamentos antigos continuam preservados."
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da obra"
          className={inputCls}
        />
        <button
          type="button"
          onClick={adicionar}
          className="shrink-0 rounded-[10px] bg-brand px-5 py-2.5 text-sm font-medium text-paper hover:bg-brand-2"
        >
          Adicionar obra
        </button>
      </div>
      {isLoading ? (
        <p className="mt-5 text-sm text-ink/60">Carregando...</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {(data ?? []).map((o) => (
            <LinhaItem
              key={o.id}
              nome={o.nome}
              ativo={o.ativo}
              onToggle={() => alternar(o.id, o.ativo)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Setores() {
  const { data, isLoading } = useSetores();
  const recarregar = useRecarregar();
  const [nome, setNome] = useState("");

  async function adicionar() {
    if (!nome.trim()) return;
    const { error } = await supabase
      .from("setores")
      .insert({ nome: nome.trim(), ordem: (data?.length ?? 0) + 1 });
    if (error) {
      toast.error("Não foi possível adicionar o setor.");
      return;
    }
    setNome("");
    toast.success("Setor adicionado.");
    recarregar("setores");
  }

  async function alternar(id: string, ativo: boolean) {
    const { error } = await supabase.from("setores").update({ ativo: !ativo }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o setor.");
      return;
    }
    toast.success(ativo ? "Setor inativado." : "Setor reativado.");
    recarregar("setores");
  }

  return (
    <div>
      <Titulo
        titulo="Setores / responsáveis"
        descricao="Setores inativos deixam de aparecer na identificação do formulário, sem apagar o histórico."
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do setor"
          className={inputCls}
        />
        <button
          type="button"
          onClick={adicionar}
          className="shrink-0 rounded-[10px] bg-brand px-5 py-2.5 text-sm font-medium text-paper hover:bg-brand-2"
        >
          Adicionar setor
        </button>
      </div>
      {isLoading ? (
        <p className="mt-5 text-sm text-ink/60">Carregando...</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {(data ?? []).map((s) => (
            <LinhaItem
              key={s.id}
              nome={s.nome}
              ativo={s.ativo}
              onToggle={() => alternar(s.id, s.ativo)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Indicadores() {
  const { data: setores } = useSetores();
  const { data: indicadores, isLoading } = useIndicadores();
  const recarregar = useRecarregar();
  const [setorId, setSetorId] = useState("");
  const [nome, setNome] = useState("");

  const lista: Indicador[] = (indicadores ?? []).filter(
    (i) => !setorId || i.setor_id === setorId,
  );
  const nomeSetor = (id: string) => setores?.find((s) => s.id === id)?.nome ?? "";

  async function adicionar() {
    if (!setorId || !nome.trim()) {
      toast.error("Escolha o setor e informe o nome do indicador.");
      return;
    }
    const { error } = await supabase.from("indicadores").insert({
      setor_id: setorId,
      nome: nome.trim(),
      ordem: lista.length + 1,
    });
    if (error) {
      toast.error("Não foi possível adicionar o indicador.");
      return;
    }
    setNome("");
    toast.success("Indicador adicionado.");
    recarregar("indicadores");
  }

  async function alternar(id: string, ativo: boolean) {
    const { error } = await supabase.from("indicadores").update({ ativo: !ativo }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o indicador.");
      return;
    }
    toast.success(ativo ? "Indicador inativado." : "Indicador reativado.");
    recarregar("indicadores");
  }

  return (
    <div>
      <Titulo
        titulo="Indicadores"
        descricao="Adicione indicadores a um setor ou inative os que saíram do escopo. Indicadores inativos não aparecem no formulário."
      />
      <div className="grid gap-2 sm:grid-cols-[16rem_1fr_auto]">
        <select value={setorId} onChange={(e) => setSetorId(e.target.value)} className={inputCls}>
          <option value="">Todos os setores</option>
          {(setores ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
              {s.ativo ? "" : " (inativo)"}
            </option>
          ))}
        </select>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do novo indicador"
          className={inputCls}
        />
        <button
          type="button"
          onClick={adicionar}
          className="shrink-0 rounded-[10px] bg-brand px-5 py-2.5 text-sm font-medium text-paper hover:bg-brand-2"
        >
          Adicionar
        </button>
      </div>
      {isLoading ? (
        <p className="mt-5 text-sm text-ink/60">Carregando...</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {lista.map((i) => (
            <LinhaItem
              key={i.id}
              nome={i.nome}
              extra={setorId ? undefined : nomeSetor(i.setor_id)}
              ativo={i.ativo}
              onToggle={() => alternar(i.id, i.ativo)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Opcoes() {
  const { data, isLoading } = useOpcoes();
  const recarregar = useRecarregar();
  const [tipo, setTipo] = useState<string>(TIPOS_OPCAO[0].tipo);
  const [valor, setValor] = useState("");

  const lista = (data ?? []).filter((o) => o.tipo === tipo);

  async function adicionar() {
    if (!valor.trim()) return;
    const { error } = await supabase
      .from("opcoes_lista")
      .insert({ tipo, valor: valor.trim(), ordem: lista.length + 1 });
    if (error) {
      toast.error("Não foi possível adicionar a opção.");
      return;
    }
    setValor("");
    toast.success("Opção adicionada.");
    recarregar("opcoes_lista");
  }

  async function alternar(id: string, ativo: boolean) {
    const { error } = await supabase.from("opcoes_lista").update({ ativo: !ativo }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar a opção.");
      return;
    }
    toast.success(ativo ? "Opção inativada." : "Opção reativada.");
    recarregar("opcoes_lista");
  }

  return (
    <div>
      <Titulo
        titulo="Listas de status"
        descricao="Ajuste as opções de Status do indicador, Status do resultado e confirmação de evidência exibidas no formulário."
      />
      <div className="grid gap-2 sm:grid-cols-[16rem_1fr_auto]">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
          {TIPOS_OPCAO.map((t) => (
            <option key={t.tipo} value={t.tipo}>
              {t.rotulo}
            </option>
          ))}
        </select>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Nova opção"
          className={inputCls}
        />
        <button
          type="button"
          onClick={adicionar}
          className="shrink-0 rounded-[10px] bg-brand px-5 py-2.5 text-sm font-medium text-paper hover:bg-brand-2"
        >
          Adicionar
        </button>
      </div>
      {isLoading ? (
        <p className="mt-5 text-sm text-ink/60">Carregando...</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {lista.map((o) => (
            <LinhaItem
              key={o.id}
              nome={o.valor}
              ativo={o.ativo}
              onToggle={() => alternar(o.id, o.ativo)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Periodo() {
  const { data } = useMesesRetroativos();
  const recarregar = useRecarregar();
  const [meses, setMeses] = useState<string>("");
  const valorAtual = meses === "" ? String(data ?? 2) : meses;

  async function salvar() {
    const n = Number(valorAtual);
    if (!Number.isInteger(n) || n < 0 || n > 11) {
      toast.error("Informe um número de 0 a 11.");
      return;
    }
    const { error } = await supabase
      .from("configuracoes")
      .update({ valor: String(n) })
      .eq("chave", "meses_retroativos");
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success("Configuração salva.");
    recarregar("configuracoes");
  }

  return (
    <div>
      <Titulo
        titulo="Período disponível"
        descricao="Define quantos meses anteriores ficam abertos para lançamento, além do mês atual. A lista rola sozinha quando o mês vira."
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="number"
          min={0}
          max={11}
          value={valorAtual}
          onChange={(e) => setMeses(e.target.value)}
          className={`${inputCls} sm:w-40`}
        />
        <button
          type="button"
          onClick={salvar}
          className="shrink-0 rounded-[10px] bg-brand px-5 py-2.5 text-sm font-medium text-paper hover:bg-brand-2"
        >
          Salvar
        </button>
      </div>
      <p className="mt-4 text-sm text-ink/60">
        Períodos que ficarão visíveis:{" "}
        <span className="font-mono text-ink">
          {periodosDisponiveis(Number(valorAtual) || 0)
            .map((p) => rotuloPeriodo(p))
            .join(" · ")}
        </span>
      </p>
    </div>
  );
}
