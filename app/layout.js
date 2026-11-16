import { Fraunces, Nunito } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata = {
  title: {
    default: "Last Bell",
    template: "%s · Last Bell",
  },
  description:
    "A time-management coach for grades 6 to 9. Survey the evening, chat through a school-night plan, and keep templates for screens, homework, and worry.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Suspense fallback={<div className="h-14 border-b border-border bg-background" />}>
          <SiteHeader />
        </Suspense>
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
