import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acesso administrativo | Indicadores Cortez" },
      {
        name: "description",
        content:
          "Área restrita para administradores do sistema de indicadores Cortez: gestão de obras, setores e indicadores.",
      },
      { property: "og:title", content: "Acesso administrativo | Indicadores Cortez" },
      {
        property: "og:description",
        content: "Entre com e-mail e senha para gerenciar obras, setores e indicadores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const inputCls =
  "mt-2 w-full rounded-[10px] bg-paper px-3.5 py-2.5 text-sm text-ink ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand/40";

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 font-sans text-ink antialiased">
      <div className="w-full max-w-sm rounded-[18px] bg-paper p-7 ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-[10px] bg-brand font-mono text-sm font-medium text-paper">
            CZ
          </div>
          <div className="leading-none">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Cortez Engenharia
            </p>
            <p className="mt-1 text-sm font-medium">Acesso administrativo</p>
          </div>
        </div>

        <h1 className="mt-6 text-xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-ink/60">
          Área restrita aos administradores do sistema de indicadores.
        </p>

        <form onSubmit={entrar} className="mt-5 space-y-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-2">
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-2">
              Senha
            </span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
              required
            />
          </div>
          {erro && (
            <p className="rounded-[10px] bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive ring-1 ring-destructive/25">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-[10px] bg-brand px-5 py-2.5 text-sm font-medium text-paper hover:bg-brand-2 disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-5 block text-center text-sm font-medium text-brand-2 hover:text-brand"
        >
          Voltar ao formulário
        </Link>
      </div>
    </div>
  );
}
