import Link from "next/link";
import { HomeActions } from "@/components/home-actions";
import { CROSS_GRADE, GRADE_IDS, GRADES } from "@/lib/grades";

const STEPS = [
  {
    title: "Say what the evening actually is",
    text: "Games, other screens, homework, or worry. The survey is seven questions. The chat will ask if you skip it.",
  },
  {
    title: "Get a school-night plan",
    text: "Bell sets an alarm, a homework block with an ending, a screen stop, and lights out aimed at the hours for your grade.",
  },
  {
    title: "Keep a card for the hard night",
    text: "Templates cover tonight, the homework block, the screen gate, a ten-minute worry slip, and the weekend.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8">
      <section className="overflow-hidden rounded-3xl bg-[oklch(0.28_0.045_250)] px-6 py-10 text-[oklch(0.97_0.015_95)] sm:px-10">
        <p className="text-sm font-medium tracking-wide text-[oklch(0.86_0.07_80)] uppercase">
          Time management for grades 6–9
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold sm:text-5xl">
          Talk through the evening before it disappears.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[oklch(0.92_0.02_95)]">
          Last Bell is a coach for students who are losing sleep to games, screens, homework, or
          worry. Chat with Bell, take a short survey, and leave with a plan you can use tonight.
        </p>
        <div className="mt-6">
          <HomeActions />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <article key={step.title} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <p className="font-heading text-3xl text-primary">{index + 1}</p>
            <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
            <p className="mt-2 text-muted-foreground">{step.text}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">The pattern, by grade</h2>
          <p className="mt-2 text-muted-foreground">{CROSS_GRADE}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {GRADE_IDS.map((grade) => (
            <Link
              key={grade}
              href={`/grades#grade-${grade}`}
              className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 hover:ring-primary/40"
            >
              <p className="font-heading text-4xl">{grade}</p>
              <h3 className="mt-1 text-xl font-semibold">{GRADES[grade].headline}</h3>
              <p className="mt-2 text-muted-foreground">{GRADES[grade].cardStat}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
