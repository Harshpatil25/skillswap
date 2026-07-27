import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useState } from "react";

import { MentorCard } from "@/components/cards/mentor-card";
import { CardGridSkeleton, EmptyState, SectionHeading } from "@/components/common/states";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Input } from "@/components/ui/input";
import { useMentors } from "@/hooks/use-skillswap-data";

export const Route = createFileRoute("/mentors/")({
  head: () => ({
    meta: [
      { title: "Find local mentors — SkillSwap" },
      {
        name: "description",
        content:
          "Browse verified mentors near you across tech, design, business, crafts and languages. Read reviews and book a session.",
      },
      { property: "og:title", content: "Find local mentors — SkillSwap" },
      {
        property: "og:description",
        content: "Verified mentors near you across tech, design, business and crafts.",
      },
    ],
  }),
  component: MentorsPage,
});

function MentorsPage() {
  const { data: mentors, isLoading } = useMentors();
  const [term, setTerm] = useState("");

  const filtered = (mentors ?? []).filter((m) =>
    [m.full_name, m.headline, m.city, ...(m.user_skills ?? []).map((s) => s.skill?.name)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-surface border-b border-border">
          <div className="container-page py-14">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Mentors in your neighbourhood
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Practitioners who teach what they do every day — rated by learners like you.
            </p>
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by name, skill or city"
              className="mt-6 h-12 max-w-md rounded-full bg-card"
              aria-label="Search mentors"
            />
          </div>
        </section>

        <section className="container-page py-12">
          <SectionHeading title={`${filtered.length} mentors available`} />
          <div className="mt-8">
            {isLoading ? (
              <CardGridSkeleton count={6} />
            ) : filtered.length === 0 ? (
              <EmptyState icon={Users} title="No mentors found" description="Try a different skill or city." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((m, i) => (
                  <MentorCard key={m.id} mentor={m} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
