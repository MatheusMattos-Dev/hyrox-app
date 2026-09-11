"use client";

import { useId, useState, useTransition } from "react";
import { deleteLessonLog, saveLessonLog } from "@/app/actions";
import { camposDoRegisto, limparCampos, NIVEIS_REGISTO, type CampoRegisto } from "@/lib/log-fields";
import type { LessonDetail } from "@/lib/types";

export function LogForm({ lesson }: { lesson: LessonDetail }) {
  const campos = camposDoRegisto(lesson);
  const registo = lesson.log;
  const prefixo = useId();

  const [aberto, setAberto] = useState(Boolean(registo));
  const [data, setData] = useState(registo?.performed_on ?? hoje());
  const [nivel, setNivel] = useState<string>(registo?.level ?? "n2");
  const [rpe, setRpe] = useState<string>(registo?.rpe ? String(registo.rpe) : "");
  const [valores, setValores] = useState<Record<string, string>>(registo?.fields ?? {});
  const [notas, setNotas] = useState(registo?.notes ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function gravar() {
    setErro(null);
    iniciar(async () => {
      const resultado = await saveLessonLog(lesson.id, {
        performed_on: data,
        level: nivel as "n1" | "n2" | "n3",
        rpe: rpe ? Number(rpe) : null,
        fields: limparCampos(valores),
        notes: notas.trim() || null,
      });

      if (!resultado.ok) setErro(resultado.erro);
    });
  }

  function apagar() {
    iniciar(async () => {
      await deleteLessonLog(lesson.id);
      setValores({});
      setNotas("");
      setRpe("");
      setAberto(false);
    });
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rotulo w-full bg-ember px-5 py-4 text-[12px] text-ink"
      >
        Registar este treino
      </button>
    );
  }

  return (
    <section className="border border-borda p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="rotulo text-[12px]">Registo do treino</h2>
        {registo ? <span className="tnum text-[12px] text-texto-fraco">guardado</span> : null}
      </div>

      <p className="mt-2 text-[13px] leading-snug text-texto-fraco">{lesson.log_what}</p>

      <div className="mt-4 space-y-4">
        <div>
          <Rotulo htmlFor={`${prefixo}-dia`}>Dia</Rotulo>
          <input
            id={`${prefixo}-dia`}
            type="date"
            value={data}
            onChange={(evento) => setData(evento.target.value)}
            className="tnum mt-1.5 w-full border border-borda bg-superficie px-3 py-2.5 text-[15px] focus:border-texto focus:outline-none"
          />
        </div>

        <div role="group" aria-labelledby={`${prefixo}-nivel`}>
          <span id={`${prefixo}-nivel`} className="rotulo block text-[10px] text-texto-fraco">
            Nível usado
          </span>
          <div className="mt-1.5 flex gap-2">
            {NIVEIS_REGISTO.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setNivel(opcao.valor)}
                aria-pressed={nivel === opcao.valor}
                className={`rotulo flex-1 border px-3 py-2.5 text-[12px] ${
                  nivel === opcao.valor
                    ? "border-ember bg-ember text-ink"
                    : "border-borda bg-superficie text-texto-fraco"
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        {campos.map((campo) => (
          <Campo
            key={campo.id}
            id={`${prefixo}-${campo.id}`}
            campo={campo}
            valor={valores[campo.id] ?? ""}
            aoMudar={(texto) => setValores((atual) => ({ ...atual, [campo.id]: texto }))}
          />
        ))}

        <div>
          <Rotulo htmlFor={`${prefixo}-rpe`}>Esforço no fim</Rotulo>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              id={`${prefixo}-rpe`}
              type="range"
              min={1}
              max={10}
              step={1}
              value={rpe || 5}
              onChange={(evento) => setRpe(evento.target.value)}
              className="h-1 flex-1 accent-ember"
            />
            <span className="tnum w-14 shrink-0 text-right text-[15px]" aria-hidden="true">
              {rpe ? `${rpe} / 10` : "—"}
            </span>
          </div>
        </div>

        <div>
          <Rotulo htmlFor={`${prefixo}-notas`}>Notas</Rotulo>
          <textarea
            id={`${prefixo}-notas`}
            value={notas}
            onChange={(evento) => setNotas(evento.target.value)}
            rows={3}
            placeholder="O que sentiu, o que mudar da próxima"
            className="mt-1.5 w-full border border-borda bg-superficie px-3 py-2.5 text-[15px] leading-snug placeholder:text-texto-fraco focus:border-texto focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={gravar}
          disabled={pendente}
          className="rotulo flex-1 bg-ember px-5 py-3.5 text-[12px] text-ink disabled:opacity-60"
        >
          {pendente ? "Guardando…" : registo ? "Atualizar registo" : "Guardar registo"}
        </button>

        {registo ? (
          <button
            type="button"
            onClick={apagar}
            disabled={pendente}
            className="text-[14px] font-semibold text-texto-fraco underline underline-offset-4 disabled:opacity-50"
          >
            Apagar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="text-[14px] font-semibold text-texto-fraco underline underline-offset-4"
          >
            Agora não
          </button>
        )}
      </div>

      {erro ? (
        <p className="mt-3 border-l-2 border-rope pl-3 text-[13px] leading-snug">
          O registo não foi guardado — o que você escreveu continua aqui. Tente de novo.
          <span className="mt-1 block text-[12px] text-texto-fraco">{erro}</span>
        </p>
      ) : !registo ? (
        <p className="mt-3 text-[12px] leading-snug text-texto-fraco">
          Guardar o registo marca a aula como concluída.
        </p>
      ) : null}
    </section>
  );
}

function Campo({
  id,
  campo,
  valor,
  aoMudar,
}: {
  id: string;
  campo: CampoRegisto;
  valor: string;
  aoMudar: (texto: string) => void;
}) {
  return (
    <div>
      <Rotulo htmlFor={id}>{campo.rotulo}</Rotulo>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          id={id}
          type={campo.modo === "numero" ? "number" : "text"}
          inputMode={campo.modo === "numero" ? "numeric" : "text"}
          value={valor}
          onChange={(evento) => aoMudar(evento.target.value)}
          placeholder={campo.dica}
          className="w-full border border-borda bg-superficie px-3 py-2.5 text-[15px] placeholder:text-texto-fraco focus:border-texto focus:outline-none"
        />
        {/* A unidade é decoração: o nome do campo já a diz por extenso. */}
        {campo.sufixo ? (
          <span className="rotulo shrink-0 text-[11px] text-texto-fraco" aria-hidden="true">
            {campo.sufixo}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Rotulo({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="rotulo block text-[10px] text-texto-fraco">
      {children}
    </label>
  );
}

function hoje() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
