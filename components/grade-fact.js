import { GRADES } from "@/lib/grades";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GradeFact({ grade, compact = false }) {
  const info = GRADES[grade];
  if (!info) return null;

  const stats = [
    info.shortSleep ? [info.shortSleepLabel, info.shortSleep] : null,
    ["Sleep they actually get", info.typicalSleep],
    info.bedtime ? ["Usual bedtime", info.bedtime] : null,
    ["Aim on your plan", info.aimNote],
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary" className="h-6 px-2">
          Grade {info.grade}
        </Badge>
        <CardTitle className="text-xl">{info.headline}</CardTitle>
        {compact ? null : <CardDescription>{info.aside}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>{info.body}</p>
        {compact ? null : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-muted px-3 py-2">
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
