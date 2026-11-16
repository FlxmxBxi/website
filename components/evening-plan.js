import { formatClock } from "@/lib/time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EveningPlan({ plan }) {
  if (!plan) return null;

  const rows = [
    ["Homework", `${formatClock(plan.homeworkStart)} – ${formatClock(plan.homeworkEnd)}`],
    plan.screenWindow > 0
      ? ["Screens, after homework", `${formatClock(plan.screenStart)} – ${formatClock(plan.screenEnd)}`]
      : ["Screens", "Off for this school night"],
    ["Wind-down", `${formatClock(plan.screenEnd)} – ${formatClock(plan.bedtime)}`],
    ["Lights out", formatClock(plan.bedtime)],
    ["Alarm", formatClock(plan.wakeMinutes)],
  ];

  return (
    <Card className="bg-accent/40">
      <CardHeader>
        <CardTitle>
          Grade {plan.grade} school night
          {plan.shortened ? " · shorter block" : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p>Aim: {plan.aimNote}.</p>
        <dl className="grid gap-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-2">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {plan.worrySlip ? (
          <p>Give worry ten minutes on paper, then close the paper.</p>
        ) : null}
        {plan.earlyHomework ? (
          <p>This wake-up time puts homework in the afternoon. If you are still at school, start when you get home and keep the end times.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
