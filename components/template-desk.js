"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { profileReady } from "@/lib/coach";
import { buildPlan } from "@/lib/plan";
import { buildTemplates } from "@/lib/templates";
import { useEvening } from "@/lib/use-evening";

export function TemplateDesk() {
  const store = useEvening();
  const plan = profileReady(store.profile) ? buildPlan(store.profile) : null;
  const [copied, setCopied] = useState("");

  async function copy(template) {
    try {
      await navigator.clipboard.writeText(template.text);
      setCopied(template.id);
    } catch {
      setCopied(`fail:${template.id}`);
    }
  }

  const templates = buildTemplates(plan);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold">Templates</h1>
        <p className="mt-2 text-muted-foreground">
          {plan
            ? `Filled in for grade ${plan.grade}. Copy a card onto a note, or keep it on your phone.`
            : "These are blanks you can copy tonight. Take the survey or tell Bell your grade and wake-up time, and the times fill in."}
        </p>
        {plan ? null : (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button nativeButton={false} render={<Link href="/survey" />} className="h-11 px-4">
              Take the survey
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/chat" />}
              variant="outline"
              className="h-11 px-4"
            >
              Chat with Bell
            </Button>
          </div>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <article key={template.id} className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div>
              <h2 className="text-2xl font-semibold">{template.title}</h2>
              <p className="mt-1 text-muted-foreground">{template.blurb}</p>
            </div>
            <pre className="flex-1 rounded-lg bg-muted p-3 font-sans text-sm whitespace-pre-wrap">
              {template.text}
            </pre>
            <div className="flex items-center gap-3">
              <Button type="button" className="h-11 px-4" onClick={() => copy(template)}>
                Copy
              </Button>
              {copied === template.id ? (
                <p className="text-sm">Copied.</p>
              ) : copied === `fail:${template.id}` ? (
                <p className="text-sm">Copy failed. Select the card and copy it yourself.</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
