import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Building2,
  CalendarCheck,
  Compass,
  GraduationCap,
  MapPin,
  Quote,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";

import heroImage from "@/assets/hero-skillswap.jpg";
import { MentorCard } from "@/components/cards/mentor-card";
import { WorkshopCard } from "@/components/cards/workshop-card";
import { CardGridSkeleton, SectionHeading } from "@/components/common/states";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMentors, usePlatformStats, useSkills, useWorkshops } from "@/hooks/use-skillswap-data";
import { trendingScore } from "@/lib/ai/recommendations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillSwap — Hyperlocal Skill Exchange & Mentorship" },
      {
        name: "description",
        content:
          "Learn practical skills from mentors near you. Join hyperlocal workshops, exchange skills, earn certificates and discover MSME internships on SkillSwap.",
      },
      { property: "og:title", content: "SkillSwap — Hyperlocal Skill Exchange & Mentorship" },
      {
        property: "og:description",
        content:
          "Find nearby mentors, hands-on workshops and local internships. Skill exchange built for your neighbourhood.",
      },
    ],
  }),
  component: LandingPage,
});

const TESTIMONIALS = [
  {
    name: "Divya R.",
    role: "BCA student, Bengaluru",
    quote:
      "I found a React mentor two kilometres from my college. Six weekends later I had a deployed project and an internship offer.",
  },
  {
    name: "Imran S.",
    role: "Cafe owner, Pune",
    quote:
      "We ran two baking workshops through SkillSwap and hired both of our apprentices from the attendees.",
  },
  {
    name: "Sneha P.",
    role: "Design mentor, Kochi",
    quote:
      "The dashboard handles registrations, attendance and certificates so I can focus on actually teaching.",
  },
];

const STEPS = [
  { icon: Compass, title: "Discover nearby", body: "Filter by skill, distance, language and format." },
  { icon: CalendarCheck, title: "Book a session", body: "Reserve a seat in seconds, online or offline." },
  { icon: GraduationCap, title: "Learn by doing", body: "Practice-first workshops with real mentors." },
  { icon: Award, title: "Get certified", body: "Earn proof and unlock local internships." },
];

function LandingPage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const { data: workshops, isLoading: loadingWorkshops } = useWorkshops({ limit: 6 });
  const { data: mentors, isLoading: loadingMentors } = useMentors({ limit: 4 });
  const { data: skills } = useSkills();
  const { data: stats } = usePlatformStats();

  const trending = [...(workshops ?? [])]
    .sort((a, b) => trendingScore(b) - trendingScore(a))
    .slice(0, 6);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({ to: "/explore", search: { q: term || undefined } });
  };

  const statItems = [
    { label: "Learners", value: stats?.learners ?? 0, icon: Users },
    { label: "Mentors", value: stats?.mentors ?? 0, icon: GraduationCap },
    { label: "Workshops", value: stats?.workshops ?? 0, icon: CalendarCheck },
    { label: "Local businesses", value: stats?.companies ?? 0, icon: Building2 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO */}
        <section className="hero-surface relative overflow-hidden border-b border-border">
          <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="rounded-full bg-primary-soft px-3 py-1 text-primary hover:bg-primary-soft">
                <MapPin className="mr-1 size-3" /> Hyperlocal learning, not generic courses
              </Badge>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Swap skills with people <span className="text-gradient-primary">near you</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                SkillSwap connects students, mentors and neighbourhood businesses for hands-on
                workshops, mentorship and internships — all within a few kilometres.
              </p>

              <form onSubmit={submitSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Try “React”, “baking”, “public speaking”…"
                    className="h-12 rounded-full border-border bg-card pl-11 shadow-soft"
                    aria-label="Search skills and workshops"
                  />
                </div>
                <Button type="submit" size="lg" variant="hero">
                  Find workshops <ArrowRight />
                </Button>
              </form>

              <div className="mt-6 flex flex-wrap gap-2">
                {(skills ?? []).slice(0, 5).map((skill) => (
                  <Link
                    key={skill.id}
                    to="/explore"
                    search={{ q: skill.name }}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {skill.name}
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <img
                src={heroImage}
                alt="Students learning together with a mentor in a local studio"
                width={1408}
                height={1104}
                className="w-full rounded-3xl border border-border object-cover shadow-lift"
              />
              <div className="surface-card absolute -bottom-6 left-4 hidden w-56 gap-3 p-4 sm:flex">
                <span className="flex size-10 items-center justify-center rounded-xl bg-success-soft text-success">
                  <Star className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">4.8 average</p>
                  <p className="text-xs text-muted-foreground">across local workshops</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-border bg-card">
          <div className="container-page grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
            {statItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold">{item.value}+</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* POPULAR SKILLS */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="container-page py-16">
          <SectionHeading
            eyebrow="Popular right now"
            title="Skills your neighbourhood is learning"
            description="Curated from live demand across local workshops and mentor profiles."
            action={
              <Button variant="outline" asChild>
                <Link to="/explore">Browse all</Link>
              </Button>
            }
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(skills ?? []).slice(0, 8).map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Link
                  to="/explore"
                  search={{ q: skill.name }}
                  className="surface-card flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div>
                    <p className="font-semibold">{skill.name}</p>
                    <p className="text-xs text-muted-foreground">{skill.category}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {skill.popularity}
                  </Badge>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURED WORKSHOPS */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="border-y border-border bg-card py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="Featured"
              title="Workshops filling up fast"
              description="Ranked by our trending algorithm: fill rate, ratings and how soon they start."
              action={
                <Button variant="outline" asChild>
                  <Link to="/explore">See all workshops</Link>
                </Button>
              }
            />
            <div className="mt-8">
              {loadingWorkshops ? (
                <CardGridSkeleton />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {trending.map((workshop, index) => (
                    <WorkshopCard key={workshop.id} workshop={workshop} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TOP MENTORS */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="container-page py-16">
          <SectionHeading
            eyebrow="Top rated"
            title="Mentors your community trusts"
            action={
              <Button variant="outline" asChild>
                <Link to="/mentors">Meet the mentors</Link>
              </Button>
            }
          />
          <div className="mt-8">
            {loadingMentors ? (
              <CardGridSkeleton count={4} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {(mentors ?? []).map((mentor, index) => (
                  <MentorCard key={mentor.id} mentor={mentor} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="border-y border-border bg-card py-16">
          <div className="container-page">
            <SectionHeading eyebrow="How SkillSwap works" title="Four steps from curious to certified" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="surface-card p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="container-page py-16">
          <SectionHeading eyebrow="Community" title="What local learners say" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((item, index) => (
              <motion.figure
                key={item.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="surface-card flex h-full flex-col gap-4 p-7"
              >
                <Quote className="size-6 text-primary" />
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-auto">
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="container-page pb-20">
          <div className="gradient-primary flex flex-col items-center gap-5 rounded-3xl px-6 py-14 text-center text-primary-foreground shadow-glow">
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Teach one skill. Learn another. Stay local.
            </h2>
            <p className="max-w-xl opacity-90">
              Create your free profile and get matched with mentors, workshops and internships around
              you today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started free
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="text-primary-foreground">
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
