"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        nativeButton={false}
        render={<Link href="/chat" />}
        className="h-11 px-4 text-base"
      >
        Chat with Bell
      </Button>
      <Button
        nativeButton={false}
        render={<Link href="/survey" />}
        variant="outline"
        className="h-11 bg-card px-4 text-base text-foreground"
      >
        Take the evening survey
      </Button>
    </div>
  );
}
