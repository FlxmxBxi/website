"use client";

import Link from "next/link";
import { useState } from "react";
import { EveningPlan } from "@/components/evening-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeProfile } from "@/lib/coach";
import { buildPlan } from "@/lib/plan";
import { saveStore } from "@/lib/storage";
import { useEvening } from "@/lib/use-evening";
import {
  CHECKIN_OPTIONS,
  CHECKIN_QUESTIONS,
  HOMEWORK_HABITS,
  SCREEN_BLOCKS,
  TRAPS,
  WORRY_LEVELS,
  describeCheckin,
  describeSurvey,
} from "@/lib/survey";
import { parseClock, toTimeInput } from "@/lib/time";

const STEPS = [
  {
    key: "grade",
    title: "What grade are you in?",
    kind: "choice",
    options: [6, 7, 8, 9].map((grade) => ({ id: grade, label: `Grade ${grade}` })),
  },
  {
    key: "wake",
    title: "What time do you have to get up on a school day?",
    kind: "time",
  },
  {
    key: "bed",
    title: "About when do you fall asleep on a school night?",
    kind: "time",
  },
  {
    key: "trap",
    title: "What usually takes your evening?",
    kind: "choice",
    options: TRAPS,
  },
  {
    key: "homeworkHabit",
    title: "How often is schoolwork finished before screens?",
    kind: "choice",
    options: HOMEWORK_HABITS,
  },
  {
    key: "screenBlock",
    title: "After dinner, how long are you on a screen?",
    kind: "choice",
    options: SCREEN_BLOCKS,
  },
  {
    key: "worryLevel",
    title: "When a test is coming, how loud is the worry?",
    kind: "choice",
    options: WORRY_LEVELS,
  },
];

function emptyAnswers() {
  return {
    grade: null,
    wake: "",
    bed: "",
    trap: null,
    homeworkHabit: null,
    screenBlock: null,
    worryLevel: null,
  };
}

function answersFromProfile(profile) {
  return {
    ...emptyAnswers(),
    grade: profile.grade,
    wake: toTimeInput(profile.wakeMinutes),
    bed: toTimeInput(profile.bedMinutes),
    trap: profile.trap,
    homeworkHabit: profile.homeworkHabit,
    screenBlock: profile.screenBlock,
    worryLevel: profile.worryLevel,
  };
}

function profileFromAnswers(answers) {
  return sanitizeProfile({
    grade: answers.grade,
    trap: answers.trap,
    wakeMinutes: parseClock(answers.wake),
    bedMinutes: parseClock(answers.bed),
    homeworkHabit: answers.homeworkHabit,
    screenBlock: answers.screenBlock,
    worryLevel: answers.worryLevel,
  });
}

function stepComplete(answers, index) {
  const step = STEPS[index];
  return step.kind === "time" ? Boolean(answers[step.key]) : answers[step.key] != null;
}

const BLANK_CHECKIN = { screens: "", homework: "", lights: "" };

export function SurveyDesk() {
  const store = useEvening();
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [stepOverride, setStepOverride] = useState(null);
  const [error, setError] = useState("");
  const [checkinDraft, setCheckinDraft] = useState(null);
  const kept = store.keep !== false;
  const storedAnswers = answersFromProfile(store.profile);
  const answers = draft ?? storedAnswers;
  const missing = STEPS.findIndex((_, index) => !stepComplete(answers, index));
  const step = stepOverride ?? (missing === -1 ? 0 : missing);
  const storedComplete = STEPS.every((_, index) => stepComplete(storedAnswers, index));
  const done = !editing && draft === null && storedComplete;
  const checkin = checkinDraft ?? store.checkin ?? BLANK_CHECKIN;

  function choose(key, value) {
    setDraft({ ...answers, [key]: value });
    setStepOverride(step);
    setError("");
  }

  function continueStep() {
    if (!stepComplete(answers, step)) {
      setError(STEPS[step].kind === "time" ? "Add a time to continue." : "Pick one to continue.");
      return;
    }
    setError("");
    if (step < STEPS.length - 1) {
      setStepOverride(step + 1);
      return;
    }
    saveStore({
      ...store,
      profile: profileFromAnswers(answers),
      messages: [],
      suggestions: [],
    });
    setDraft(null);
    setEditing(false);
    setStepOverride(null);
  }

  function saveCheckin(next) {
    setCheckinDraft(next);
    if (CHECKIN_QUESTIONS.some((question) => !next[question.id])) return;
    saveStore({ ...store, checkin: next });
    setCheckinDraft(null);
  }

  const profile = profileFromAnswers(answers);
  const plan = buildPlan(profile);
  const checkinReady = CHECKIN_QUESTIONS.every((question) => checkin[question.id]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-4xl font-semibold">Evening survey</h1>
        <p className="mt-2 text-muted-foreground">
          Seven questions, about two minutes. Bell uses the answers in the chat and on the
          templates. Nothing is sent to a server.
        </p>
      </div>
      {!kept ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm">
          This browser didn&apos;t keep your answers. You can still finish the survey in this tab.
        </p>
      ) : null}

      {done ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">What your answers line up with</h2>
          {describeSurvey(profile).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <EveningPlan plan={plan} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button nativeButton={false} render={<Link href="/chat" />} className="h-11 px-4 text-base">
              Talk this through with Bell
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/templates" />}
              variant="outline"
              className="h-11 px-4 text-base"
            >
              Open the templates
            </Button>
            <Button
              variant="ghost"
              className="h-11"
              onClick={() => {
                setEditing(true);
                setDraft(answers);
                setStepOverride(0);
              }}
            >
              Retake the survey
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            Question {step + 1} of {STEPS.length}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{STEPS[step].title}</h2>
          <div className="mt-4">
            {STEPS[step].kind === "time" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor={STEPS[step].key}>Time</Label>
                <Input
                  id={STEPS[step].key}
                  type="time"
                  value={answers[STEPS[step].key]}
                  onChange={(event) => choose(STEPS[step].key, event.target.value)}
                  className="h-11 max-w-48 text-base"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2" role="group" aria-label={STEPS[step].title}>
                {STEPS[step].options.map((option) => {
                  const selected = answers[STEPS[step].key] === option.id;
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className="h-11 justify-start px-4 text-base"
                      aria-pressed={selected}
                      onClick={() => choose(STEPS[step].key, option.id)}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          {error ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              className="h-11"
              disabled={step === 0}
              onClick={() => {
                setError("");
                setStepOverride(step - 1);
              }}
            >
              Back
            </Button>
            <Button className="h-11 px-4" onClick={continueStep}>
              {step === STEPS.length - 1 ? "See my evening" : "Continue"}
            </Button>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div>
          <h2 className="text-2xl font-semibold">This week&apos;s check-in</h2>
          <p className="mt-1 text-muted-foreground">
            Three questions after you have tried the plan. The note stays on this device.
          </p>
        </div>
        {CHECKIN_QUESTIONS.map((question) => (
          <fieldset key={question.id} className="flex flex-col gap-2">
            <legend className="font-medium">{question.prompt}</legend>
            <div className="flex flex-wrap gap-2">
              {CHECKIN_OPTIONS.map((option) => {
                const selected = checkin[question.id] === option;
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    className="h-10 px-3"
                    aria-pressed={selected}
                    onClick={() => saveCheckin({ ...checkin, [question.id]: option })}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </fieldset>
        ))}
        {checkinReady ? <p>{describeCheckin(checkin)}</p> : (
          <p className="text-sm text-muted-foreground">Answer all three to get a next step.</p>
        )}
      </section>
    </div>
  );
}
