import Link from "next/link";
import { GradeFact } from "@/components/grade-fact";
import { Button } from "@/components/ui/button";
import { CROSS_GRADE, GRADE_IDS } from "@/lib/grades";

export const metadata = {
  title: "Grades",
};

export default function GradesPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-4xl font-semibold">What happens to the evening</h1>
        <p className="mt-3">{CROSS_GRADE}</p>
        <p className="mt-3 text-muted-foreground">
          Younger students more often lose the night to games and screens. Older students more
          often lose it to homework and worry. The plans on this site use 9 hours for grades 6 and
          7, and 8 hours for grades 8 and 9.
        </p>
        <div className="mt-5">
          <Button nativeButton={false} render={<Link href="/chat" />} className="h-11 px-4 text-base">
            Start with your grade
          </Button>
        </div>
      </div>
      {GRADE_IDS.map((grade) => (
        <div key={grade} id={`grade-${grade}`} className="scroll-mt-24">
          <GradeFact grade={grade} />
        </div>
      ))}
    </div>
  );
}
