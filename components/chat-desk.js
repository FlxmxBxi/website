"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EveningPlan } from "@/components/evening-plan";
import { GradeFact } from "@/components/grade-fact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { replyTo, sessionFromStore } from "@/lib/coach";
import { CROSS_GRADE } from "@/lib/grades";
import { clearStore, saveStore } from "@/lib/storage";
import { useEvening } from "@/lib/use-evening";

export function ChatDesk() {
  const params = useSearchParams();
  const store = useEvening();
  const requested = Number(params.get("grade"));
  const session = useMemo(() => sessionFromStore(store, requested), [store, requested]);
  const [draft, setDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const endRef = useRef(null);
  const kept = store.keep !== false;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [session]);

  function send(text) {
    const value = (text ?? draft).trim();
    if (!value) return;
    setDraft("");
    setConfirmReset(false);
    const next = replyTo(session, value);
    saveStore({
      ...store,
      profile: next.profile,
      messages: next.messages,
      suggestions: next.suggestions,
    });
  }

  function reset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    clearStore();
    setConfirmReset(false);
  }

  const lastPlanIndex = session.messages.reduce(
    (found, message, index) => (message.showPlan ? index : found),
    -1,
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.15fr)]">
      <aside className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Chat with Bell</h1>
          <p className="mt-2 text-muted-foreground">
            Bell is a time-management coach for the hours after school. The replies come from the
            grade 6–9 notes on this site, and they stay in this browser.
          </p>
        </div>
        {session.profile.grade ? (
          <GradeFact grade={session.profile.grade} compact />
        ) : (
          <p className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">{CROSS_GRADE}</p>
        )}
      </aside>

      <section className="flex min-h-[70dvh] flex-col rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="font-heading text-lg">Tonight</p>
          <Button variant="ghost" className="h-9" onClick={reset}>
            {confirmReset ? "Clear everything?" : "Start over"}
          </Button>
        </div>
        {!kept ? (
          <p className="border-b border-border px-4 py-2 text-sm text-muted-foreground">
            This browser didn&apos;t keep your answers. You can still use the coach in this tab.
          </p>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          {session.messages.map((message, index) => (
            <div
              key={message.id}
              className={message.role === "student" ? "ml-8 self-end" : "mr-8 self-start"}
            >
              <p
                className={`rounded-2xl px-3 py-2 ${
                  message.role === "student"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted"
                }`}
              >
                {message.text}
              </p>
              {index === lastPlanIndex && session.plan ? (
                <div className="mt-3">
                  <EveningPlan plan={session.plan} />
                </div>
              ) : null}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t border-border px-4 py-3">
          {session.suggestions.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {session.suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="h-10 px-3"
                  onClick={() => send(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          ) : null}
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <label htmlFor="bell-message" className="sr-only">
              Message Bell
            </label>
            <Input
              id="bell-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tell Bell about tonight"
              maxLength={500}
              className="h-11 text-base"
            />
            <Button type="submit" className="h-11 px-4" disabled={!draft.trim()}>
              Send
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
