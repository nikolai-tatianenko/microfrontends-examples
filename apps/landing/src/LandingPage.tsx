import { Layers, PlugZap, ShieldCheck, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { copy } from "./copy";

const ICONS: Record<(typeof copy.pillars)[number]["icon"], LucideIcon> = {
  deploy: Layers,
  contract: PlugZap,
  isolation: ShieldCheck,
};

/** Hero: what this is, and the three places a visitor can go next. */
export function Hero() {
  return (
    <section
      className="flex flex-col items-center gap-6 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,oklch(0.62_0.17_255/0.14),transparent),radial-gradient(ellipse_40%_40%_at_85%_10%,oklch(0.68_0.17_145/0.1),transparent),radial-gradient(ellipse_40%_40%_at_15%_20%,oklch(0.72_0.17_55/0.1),transparent)] px-6 py-20 text-center"
      data-test-id="landing-hero"
    >
      <Badge variant="outline">{copy.badge}</Badge>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        {copy.title}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">{copy.lead}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <Link to="/auth/signup" data-test-id="landing-cta-start">
            {copy.cta.start}
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/blog" data-test-id="landing-cta-blog">
            {copy.cta.blog}
          </Link>
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <Link to="/pricing" data-test-id="landing-cta-pricing">
            {copy.cta.pricing}
          </Link>
        </Button>
      </div>
    </section>
  );
}

/** The three ideas the demo is about. */
export function Pillars() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
        {copy.pillarsTitle}
      </h2>
      <ul className="grid gap-4 md:grid-cols-3" data-test-id="landing-pillars">
        {copy.pillars.map(({ icon, title, text }) => {
          const Icon = ICONS[icon];
          return (
            <li key={title} className="flex">
              <Card className="w-full">
                <CardHeader>
                  <Icon aria-hidden className="size-6" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Every app and the stack it was built with; the current one is marked. */
export function StackGrid() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        {copy.stackTitle}
      </h2>
      <p className="mt-2 mb-8 text-center text-muted-foreground">
        {copy.stackLead}
      </p>
      <ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-test-id="landing-stack"
      >
        {copy.stack.map((app) => (
          <li
            key={app.name}
            className="flex"
            data-test-id={`landing-app-${app.name}`}
          >
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{app.name}</CardTitle>
                  <Badge variant={"current" in app ? "default" : "secondary"}>
                    {"current" in app ? copy.currentLabel : app.role}
                  </Badge>
                </div>
                <CardDescription>{app.tech}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Closing call to action. */
export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-12 pb-24">
      <Card className="items-center text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            {copy.finalTitle}
          </h2>
          <p className="max-w-xl text-muted-foreground">{copy.finalText}</p>
          <Button asChild>
            <Link to="/auth/signin" data-test-id="landing-cta-signin">
              {copy.finalCta}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

/** The landing page: static content, so there is no container/View split to make. */
export function LandingPage() {
  return (
    <main data-test-id="landing">
      <Hero />
      <Pillars />
      <StackGrid />
      <FinalCta />
    </main>
  );
}
