import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, Compass, GraduationCap, Sparkles, TrendingUp } from "lucide-react";

import { WorkshopCard } from "@/components/cards/workshop-card";
import { CardGridSkeleton, EmptyState, SectionHeading } from "@/components/common/states";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import {
  useCertificates,
  useMyRegistrations,
  useWorkshops,
} from "@/hooks/use-skillswap-data";
import { buildCareerRoadmap, recommendationScore } from "@/lib/ai/recommendations";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  head: () => ({
    meta: [
      { title: "Student dashboard | SkillSwap" },
      { name: "description", content: "Track your workshops, progress, certificates and AI recommendations." },
      { property: "og:title", content: "Student dashboard | SkillSwap" },
      { property: "og:description", content: "Track your learning journey on SkillSwap." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { profile } = useAuth();
  const { data: registrations = [], isLoading } = useMyRegistrations(profile?.id);
  const { data: certificates = [] } = useCertificates(profile?.id);
  const { data: workshops = [], isLoading: loadingWorkshops } = useWorkshops({ limit: 24 });

  const registeredIds = new Set(registrations.map((r) => r.workshop_id));
  const recommended = workshops
    .filter((w) => !registeredIds.has(w.id))
    .map((w) => ({ ...w, match: recommendationScore(w, profile ?? null, []) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);

  const avgProgress = registrations.length
    ? Math.round(registrations.reduce((sum, r) => sum + (r.progress ?? 0), 0) / registrations.length)
    : 0;

  const roadmap = buildCareerRoadmap(profile ?? null, registrations.map((r) => r.workshop?.category ?? ""));

  return (
    <DashboardShell
      title={`Welcome back, ${profile?.full_name?.split(" ")[0] ?? "learner"}`}
      description="Your hyperlocal learning hub"
      actions={
        <Button size="sm" variant="hero" asChild>
          <Link to="/explore">
            <Compass /> Explore
          </Link>
        </Button>
      }
    >
      <StatGrid>
        <StatCard icon={GraduationCap} label="Enrolled" value={registrations.length} hint="Workshops joined" />
        <StatCard icon={TrendingUp} label="Avg progress" value={`${avgProgress}%`} hint="Across all courses" />
        <StatCard icon={Award} label="Certificates" value={certificates.length} hint="Earned so far" />
        <StatCard icon={Sparkles} label="Skill level" value={profile?.experience_years ? `${profile.experience_years}y` : "New"} hint="Experience" />
      </StatGrid>

      <section className="space-y-4">
        <SectionHeading title="Continue learning" description="Pick up where you left off" />
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : registrations.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No workshops yet"
            description="Browse hyperlocal workshops near you and reserve your first seat."
            action={
              <Button asChild variant="hero" size="sm">
                <Link to="/explore">Find a workshop</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {registrations.map((r) => (
              <div key={r.id} className="surface-card space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{r.workshop?.title ?? "Workshop"}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.workshop?.starts_at ? formatDateTime(r.workshop.starts_at) : "Scheduled soon"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{r.status}</Badge>
                </div>
                <Progress value={r.progress ?? 0} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{r.progress ?? 0}% complete</span>
                  {r.workshop?.slug && (
                    <Link
                      to="/workshops/$slug"
                      params={{ slug: r.workshop.slug }}
                      className="font-medium text-primary hover:underline"
                    >
                      Open
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="AI powered"
          title="Recommended for you"
          description="Matched on your skills, city, level and budget"
        />
        {loadingWorkshops ? (
          <CardGridSkeleton count={3} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {recommended.map((w, i) => (
              <WorkshopCard key={w.id} workshop={w} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading eyebrow="AI powered" title="Your career roadmap" />
        <div className="grid gap-4 md:grid-cols-3">
          {roadmap.map((step, i) => (
            <div key={step.title} className="surface-card space-y-2 p-5">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Step {i + 1}
              </span>
              <p className="font-semibold">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
