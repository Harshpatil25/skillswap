import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How SkillSwap Works — Learn, Teach, Get Hired Locally" },
      {
        name: "description",
        content:
          "See how SkillSwap matches you with nearby mentors, hands-on workshops and MSME internships using transparent recommendation scoring.",
      },
      { property: "og:title", content: "How SkillSwap Works" },
      {
        property: "og:description",
        content: "Hyperlocal skill exchange: find mentors, join workshops, earn certificates, get hired.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const STEPS = [
  {
    title: "Create your skill profile",
    body: "Tell us what you want to learn, what you can teach, your city and your availability. It takes two minutes.",
  },
  {
    title: "Get matched hyperlocally",
    body: "Our scoring engine blends skill match (40%), distance (25%), mentor rating (20%) and popularity (15%) to rank what is worth your weekend.",
  },
  {
    title: "Learn by doing",
    body: "Join workshops online, offline or hybrid. Practice-heavy sessions with real mentors from your own neighbourhood.",
  },
  {
    title: "Earn proof and opportunities",
    body: "Collect verifiable certificates, build a portfolio and apply to internships at nearby MSMEs that already trust the platform.",
  },
];

const FAQ = [
  {
    q: "Who can join SkillSwap?",
    a: "Students, working professionals, independent mentors and local MSMEs. Each gets a dedicated dashboard built for their workflow.",
  },
  {
    q: "How is the recommendation score calculated?",
    a: "It is a transparent formula: 40% skill match, 25% distance from you, 20% mentor rating with review-volume confidence, and 15% popularity from fill-rate and views.",
  },
  {
    q: "Are workshops free?",
    a: "Many are. Mentors set their own price, and plenty of community sessions are completely free to attend.",
  },
  {
    q: "How do MSMEs benefit?",
    a: "They run workshops to find talent early, post internships, review applicants and see analytics on local skill supply.",
  },
];

function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-surface border-b border-border">
          <div className="container-page py-16 sm:py-24">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              How it works
            </span>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Learning that happens within a few kilometres of you
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              SkillSwap is not another video course library. It connects you to real people nearby
              who teach what they practise every day.
            </p>
          </div>
        </section>

        <section className="container-page py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {STEPS.map((step, index) => (
              <div key={step.title} className="surface-card p-7">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-base font-bold text-primary">
                  {index + 1}
                </span>
                <h2 className="mt-4 text-lg font-bold">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page pb-20">
          <div className="surface-card p-7">
            <h2 className="text-xl font-bold">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-4">
              {FAQ.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left text-sm font-semibold">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="surface-card gradient-primary mt-10 flex flex-col items-center gap-4 p-10 text-center text-primary-foreground">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to swap your first skill?</h2>
            <p className="max-w-xl opacity-90">
              Join thousands of learners and mentors building practical skills together.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Create free account
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
