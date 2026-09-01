import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  EVIDENCIA_OPCOES,
  PERIODOS,
  PROJETOS,
  RESPONSAVEIS,
  RESPONSAVEIS_INDICADORES,
  STATUS_INDICADOR,
  STATUS_RESULTADO,
  rotuloPeriodo,
} from "@/lib/indicadores-data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lançamento de Indicadores | Cortez Engenharia" },
      {
        name: "description",
        content:
          "Ficha digital de lançamento dos indicadores Cortez: período, projeto, responsável, indicador, resultado e evidência.",
      },
      { property: "og:title", content: "Lançamento de Indicadores | Cortez Engenharia" },
      {
        property: "og:description",
        content:
          "Ficha digital de lançamento dos indicadores Cortez: período, projeto, responsável, indicador, resultado e evidência.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type FormData = {
  email: string;
  periodo: string;
  projeto: string;
  responsavel: string;
  indicador: string;
  statusIndicador: string;
  resultado: string;
  statusResultado: string;
  parecer: string;
  planoAcao: string;
  evidencia: string;
};

const INICIAL: FormData = {
  email: "",
  periodo: "",
  projeto: "",
  responsavel: "",
  indicador: "",
  statusIndicador: "",
  resultado: "",
  statusResultado: "",
  parecer: "",
  planoAcao: "",
  evidencia: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-2">
      {children}
    </span>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "rounded-[10px] bg-brand px-4 py-3 text-left text-sm font-medium text-paper ring-2 ring-brand"
          : "rounded-[10px] bg-paper px-4 py-3 text-left text-sm text-ink/70 ring-1 ring-line transition hover:bg-surface hover:ring-brand/40"
      }
    >
      <span className="flex items-center justify-between gap-2">
        <span>{children}</span>
        {selected && (
          <span className="rounded-full bg-paper/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
            Selec.
          </span>
        )}
      </span>
    </button>
  );
}

const inputCls =
  "mt-2 w-full rounded-[10px] bg-paper px-3.5 py-2.5 text-sm text-ink ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand/40";

function Index() {
  const [form, setForm] = useState<FormData>(INICIAL);
  const [etapa, setEtapa] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [protocolo, setProtocolo] = useState("");

  const medido = form.statusIndicador === "Realizado | Medido";
  const precisaParecer =
    medido &&
    (form.statusResultado === "Em Alerta" ||
      form.statusResultado === "Não Alcançada");

  const etapas = useMemo(() => {
    const lista = [
      "email",
      "periodo",
      "projeto",
      "indicador",
      "statusIndicador",
    ];
    if (medido) {
      lista.push("resultado", "statusResultado");
      if (precisaParecer) lista.push("parecer");
    }
    lista.push("evidencia", "revisao");
    return lista;
  }, [medido, precisaParecer]);

  const etapaAtual = etapas[Math.min(etapa, etapas.length - 1)] ?? "email";
  const total = etapas.length;
  const progresso = Math.round(((etapa + 1) / total) * 100);

  const indicadores = form.responsavel
    ? (RESPONSAVEIS_INDICADORES[form.responsavel] ?? [])
    : [];

  function set<K extends keyof FormData>(campo: K, valor: FormData[K]) {
    setForm((f) => {
      const novo = { ...f, [campo]: valor };
      if (campo === "responsavel") novo.indicador = "";
      if (campo === "statusIndicador") {
        novo.resultado = "";
        novo.statusResultado = "";
        novo.parecer = "";
        novo.planoAcao = "";
      }
      if (campo === "statusResultado") {
        novo.parecer = "";
        novo.planoAcao = "";
      }
      return novo;
    });
    setErro("");
  }

  function validar(): string {
    switch (etapaAtual) {
      case "email":
        if (!EMAIL_RE.test(form.email.trim()))
          return "Informe um e-mail corporativo válido.";
        return form.responsavel
          ? ""
          : "Selecione o setor pelo qual você é responsável.";
      case "periodo":
        return form.periodo ? "" : "Selecione o período.";
      case "projeto":
        return form.projeto ? "" : "Selecione o projeto.";
      case "indicador":
        return form.indicador ? "" : "Selecione o indicador.";
      case "statusIndicador":
        return form.statusIndicador ? "" : "Selecione o status do indicador.";
      case "resultado": {
        if (!form.resultado.trim()) return "Informe o resultado.";
        return Number.isNaN(Number(form.resultado.replace(",", ".")))
          ? "Informe apenas o número. Ex.: 87,32 ou 87.32"
          : "";
      }
      case "statusResultado":
        return form.statusResultado ? "" : "Selecione o status do resultado.";
      case "parecer":
        return form.parecer.trim() ? "" : "Informe o parecer do indicador.";
      case "evidencia":
        return form.evidencia ? "" : "Confirme o envio da evidência.";
      default:
        return "";
    }
  }

  function avancar() {
    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }
    setErro("");
    setEtapa((e) => Math.min(e + 1, total - 1));
  }

  function voltar() {
    setErro("");
    setEtapa((e) => Math.max(e - 1, 0));
  }

  async function enviar() {
    setEnviando(true);
    setErro("");
    const id = crypto.randomUUID();
    const { error } = await supabase.from("lancamentos_indicadores").insert({
      id,
      email: form.email.trim(),
      periodo: form.periodo,
      projeto: form.projeto,
      responsavel: form.responsavel,
      indicador: form.indicador,
      status_indicador: form.statusIndicador,
      resultado: medido ? Number(form.resultado.replace(",", ".")) : null,
      status_resultado: medido ? form.statusResultado : null,
      parecer: precisaParecer ? form.parecer.trim() : null,
      plano_acao:
        precisaParecer && form.planoAcao.trim() ? form.planoAcao.trim() : null,
      evidencia: form.evidencia,
    });
    setEnviando(false);
    if (error) {
      setErro("Não foi possível enviar. Tente novamente.");
      return;
    }
    setProtocolo(id.slice(0, 8).toUpperCase());
  }

  function novoLancamento() {
    setForm(INICIAL);
    setEtapa(0);
    setErro("");
    setProtocolo("");
  }

  const titulos: Record<string, { titulo: string; descricao: string }> = {
    email: {
      titulo: "Identificação",
      descricao:
        "Informe seu e-mail corporativo Cortez e o setor pelo qual você é responsável.",
    },
    periodo: {
      titulo: "Período",
      descricao: "Selecione o mês de referência do lançamento.",
    },
    projeto: {
      titulo: "Projeto",
      descricao: "Selecione a obra vinculada ao indicador.",
    },
    indicador: {
      titulo: "Indicador",
      descricao: `Indicadores disponíveis para ${form.responsavel || "o setor selecionado"}.`,
    },
    statusIndicador: {
      titulo: "Status do indicador",
      descricao: "Informe a situação do indicador no período.",
    },
    resultado: {
      titulo: "Resultado",
      descricao:
        "Se o indicador for percentual, preencha apenas o número. Ex.: 100% → 100; 87,32% → 87.32",
    },
    statusResultado: {
      titulo: "Status do resultado",
      descricao: "A meta do indicador foi atingida?",
    },
    parecer: {
      titulo: "Parecer e plano de ação",
      descricao:
        form.statusResultado === "Não Alcançada"
          ? "Informe o parecer e o número da ação aberta no SICLOPE."
          : "Informe o parecer do indicador e, se houver, o número da ação no SICLOPE.",
    },
    evidencia: {
      titulo: "Evidência",
      descricao:
        "Anexe sua evidência no caminho \\\\192.168.90.10\\Qualidade - Indicadores e confirme abaixo.",
    },
    revisao: {
      titulo: "Revisão e envio",
      descricao: "Confira os dados antes de carimbar o lançamento.",
    },
  };

  if (protocolo) {
    return (
      <Shell form={form}>
        <div className="px-6 py-10 text-center step-active">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-golden font-mono text-lg font-medium text-ink">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
            Lançamento carimbado
          </h1>
          <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-ink/70">
            Seu lançamento foi registrado com sucesso no sistema de indicadores
            Cortez.
          </p>
          <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-[10px] bg-surface px-5 py-3 ring-1 ring-line">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-2">
              Protocolo
            </span>
            <span className="font-mono text-lg font-medium text-ink">
              {protocolo}
            </span>
          </div>
          <div className="mt-8">
            <button
              type="button"
              onClick={novoLancamento}
              className="rounded-[10px] bg-brand px-5 py-2.5 text-sm font-medium text-paper ring-1 ring-brand hover:bg-brand-2"
            >
              Novo lançamento
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const meta = titulos[etapaAtual] ?? { titulo: "", descricao: "" };

  return (
    <Shell form={form}>
      {/* progresso */}
      <div className="border-b border-line/70 px-6 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-2">
              Etapa {etapa + 1} de {total}
            </p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-balance sm:text-3xl">
              {meta.titulo}
            </h1>
          </div>
          <span className="font-mono text-sm text-golden">{progresso}%</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line/70">
          <div
            className="h-full rounded-full bg-golden transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1.5 pb-4">
          {etapas.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-6 rounded-full ${
                i < etapa ? "bg-brand" : i === etapa ? "bg-golden" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      {/* conteúdo da etapa */}
      <div key={etapaAtual} className="step-active px-6 py-6">
        <p className="max-w-[52ch] text-sm leading-relaxed text-ink/70 text-pretty">
          {meta.descricao}
        </p>

        <div className="mt-6">
          {etapaAtual === "email" && (
            <div className="space-y-6">
              <div>
                <Label>E-mail *</Label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="seu.nome@cortez.com.br"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <Label>Setor pelo qual você é responsável *</Label>
                <select
                  value={form.responsavel}
                  onChange={(e) => set("responsavel", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Selecione o setor…</option>
                  {RESPONSAVEIS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {form.responsavel && (
                  <p className="mt-2 text-xs leading-relaxed text-ink/60">
                    Só aparecerão os indicadores de{" "}
                    <span className="font-medium text-ink">
                      {form.responsavel}
                    </span>
                    .
                  </p>
                )}
              </div>
            </div>
          )}

          {etapaAtual === "periodo" && (
            <div>
              <Label>Período *</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PERIODOS.map((p) => (
                  <OptionButton
                    key={p}
                    selected={form.periodo === p}
                    onClick={() => set("periodo", p)}
                  >
                    {rotuloPeriodo(p)}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "projeto" && (
            <div>
              <Label>Projeto *</Label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PROJETOS.map((p) => (
                  <OptionButton
                    key={p}
                    selected={form.projeto === p}
                    onClick={() => set("projeto", p)}
                  >
                    {p}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}




          {etapaAtual === "indicador" && (
            <div>
              <Label>Indicador *</Label>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {indicadores.map((i) => (
                  <OptionButton
                    key={i}
                    selected={form.indicador === i}
                    onClick={() => set("indicador", i)}
                  >
                    {i}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "statusIndicador" && (
            <div>
              <Label>Status do indicador *</Label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STATUS_INDICADOR.map((s) => (
                  <OptionButton
                    key={s}
                    selected={form.statusIndicador === s}
                    onClick={() => set("statusIndicador", s)}
                  >
                    {s}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "resultado" && (
            <div>
              <Label>Resultado *</Label>
              <input
                type="text"
                inputMode="decimal"
                value={form.resultado}
                onChange={(e) => set("resultado", e.target.value)}
                placeholder="Ex.: 87.32"
                className={`${inputCls} font-mono`}
                autoFocus
              />
            </div>
          )}

          {etapaAtual === "statusResultado" && (
            <div>
              <Label>Status do resultado *</Label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {STATUS_RESULTADO.map((s) => (
                  <OptionButton
                    key={s}
                    selected={form.statusResultado === s}
                    onClick={() => set("statusResultado", s)}
                  >
                    {s}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "parecer" && (
            <div className="space-y-5">
              <div>
                <Label>Parecer do indicador *</Label>
                <textarea
                  rows={4}
                  value={form.parecer}
                  onChange={(e) => set("parecer", e.target.value)}
                  placeholder="Descreva a análise do resultado..."
                  className={`${inputCls} resize-y`}
                />
              </div>
              <div>
                <Label>
                  Plano de ação
                  {form.statusResultado === "Não Alcançada"
                    ? ""
                    : " (opcional)"}
                </Label>
                <textarea
                  rows={3}
                  value={form.planoAcao}
                  onChange={(e) => set("planoAcao", e.target.value)}
                  placeholder="Informe o número da ação aberta no SICLOPE se o indicador foi NÃO ALCANÇADO."
                  className={`${inputCls} resize-y`}
                />
              </div>
            </div>
          )}

          {etapaAtual === "evidencia" && (
            <div>
              <Label>Confirma o envio da evidência? *</Label>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {EVIDENCIA_OPCOES.map((o) => (
                  <OptionButton
                    key={o}
                    selected={form.evidencia === o}
                    onClick={() => set("evidencia", o)}
                  >
                    {o}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {etapaAtual === "revisao" && (
            <dl className="space-y-3 rounded-[10px] bg-surface p-5 text-sm ring-1 ring-line">
              <ResumoItem rotulo="E-mail" valor={form.email} />
              <ResumoItem rotulo="Período" valor={rotuloPeriodo(form.periodo)} mono />
              <ResumoItem rotulo="Projeto" valor={form.projeto} />
              <ResumoItem rotulo="Responsável" valor={form.responsavel} />
              <ResumoItem rotulo="Indicador" valor={form.indicador} />
              <ResumoItem rotulo="Status do indicador" valor={form.statusIndicador} />
              {medido && (
                <>
                  <ResumoItem rotulo="Resultado" valor={form.resultado} mono />
                  <ResumoItem rotulo="Status do resultado" valor={form.statusResultado} />
                </>
              )}
              {precisaParecer && (
                <>
                  <ResumoItem rotulo="Parecer" valor={form.parecer} />
                  {form.planoAcao && (
                    <ResumoItem rotulo="Plano de ação" valor={form.planoAcao} />
                  )}
                </>
              )}
              <ResumoItem rotulo="Evidência" valor={form.evidencia} />
            </dl>
          )}
        </div>

        {erro && (
          <p className="mt-4 rounded-[10px] bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive ring-1 ring-destructive/25">
            {erro}
          </p>
        )}

        <p className="mt-4 text-xs text-ink/50">
          * Campos obrigatórios.
        </p>
      </div>

      {/* rodapé */}
      <div className="flex items-center justify-between border-t border-line/70 px-6 py-4">
        <button
          type="button"
          onClick={voltar}
          disabled={etapa === 0}
          className="text-sm font-medium text-brand-2 hover:text-brand disabled:opacity-40"
        >
          Voltar
        </button>
        {etapaAtual === "revisao" ? (
          <button
            type="button"
            onClick={enviar}
            disabled={enviando}
            className="rounded-[10px] bg-golden px-5 py-2 text-sm font-medium text-ink ring-1 ring-golden hover:brightness-105 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Carimbar lançamento"}
          </button>
        ) : (
          <button
            type="button"
            onClick={avancar}
            className="rounded-[10px] bg-brand px-5 py-2 text-sm font-medium text-paper ring-1 ring-brand hover:bg-brand-2"
          >
            Avançar etapa
          </button>
        )}
      </div>
    </Shell>
  );
}

function ResumoItem({
  rotulo,
  valor,
  mono,
}: {
  rotulo: string;
  valor: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ink/55">{rotulo}</dt>
      <dd
        className={`text-right font-medium text-ink ${mono ? "font-mono" : ""}`}
      >
        {valor}
      </dd>
    </div>
  );
}

function Shell({
  form,
  children,
}: {
  form: FormData;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans text-ink antialiased">
      <header className="border-b border-line/80 bg-paper/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[10px] bg-brand font-mono text-sm font-medium text-paper ring-1 ring-brand">
              CZ
            </div>
            <div className="leading-none">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
                Cortez Engenharia
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                Ficha de lançamento de indicadores
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-brand/8 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-brand-2 ring-1 ring-brand/15">
              Lote 2026
            </span>
            {form.responsavel && (
              <span className="rounded-full bg-golden/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-golden ring-1 ring-golden/25">
                Setor: {form.responsavel}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-[18px] bg-paper ring-1 ring-black/5">
          {children}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[18px] bg-paper p-5 ring-1 ring-black/5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-2">
              Resumo da ficha
            </p>
            <dl className="mt-3 space-y-3 text-sm">
              <ResumoItem rotulo="E-mail" valor={form.email || "—"} />
              <ResumoItem
                rotulo="Período"
                valor={form.periodo ? rotuloPeriodo(form.periodo) : "—"}
                mono
              />
              <ResumoItem rotulo="Obra" valor={form.projeto || "—"} />
              <ResumoItem rotulo="Setor" valor={form.responsavel || "—"} />
              {form.indicador && (
                <ResumoItem rotulo="Indicador" valor={form.indicador} />
              )}
            </dl>
          </div>

          <div className="rounded-[18px] bg-brand p-5 text-paper ring-1 ring-brand">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/70">
              Prestação
            </p>
            <p className="mt-1 text-lg font-semibold leading-tight">
              Ficha técnica de obra
            </p>
            <p className="mt-2 text-sm leading-relaxed text-paper/75">
              Preenchimento em etapas com validação de campos obrigatórios
              antes do carimbo de aprovação.
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-paper/15 pt-4">
              <div className="grid size-10 place-items-center rounded-full bg-golden font-mono text-xs font-medium text-brand">
                A
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium">Aguardando envio</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
                  Carimbo liberado na revisão
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
