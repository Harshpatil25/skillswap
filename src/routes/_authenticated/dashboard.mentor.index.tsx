import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, IndianRupee, Star, Users } from "lucide-react";

import { CardGridSkeleton, EmptyState, SectionHeading } from "@/components/common/states";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMentorParticipants, useMyWorkshops } from "@/hooks/use-skillswap-data";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/mentor/")({
  head: () => ({
    meta: [
      { title: "Mentor dashboard | SkillSwap" },
      { name: "description", content: "Track your workshops, learners, ratings and earnings as a SkillSwap mentor." },
      { property: "og:title", content: "Mentor dashboard | SkillSwap" },
      { property: "og:description", content: "Your teaching performance at a glance." },
    ],
  }),
  component: MentorDashboard,
});

function MentorDashboard() {
  const { profile } = useAuth();
  const { data: workshops = [], isLoading } = useMyWorkshops(profile?.id);
  const { data: participants = [] } = useMentorParticipants(profile?.id);

  const totalSeats = workshops.reduce((s, w) => s + w.seats_taken, 0);
  const earnings = workshops.reduce((s, w) => s + Number(w.price) * w.seats_taken, 0);
  const upcoming = workshops.filter((w) => new Date(w.starts_at) > new Date());

  return (
    <DashboardShell
      title={`Hello, ${profile?.full_name?.split(" ")[0] ?? "mentor"}`}
      description="Your teaching workspace"
      actions={
        <Button size="sm" variant="hero" asChild>
          <Link to="/dashboard/mentor/workshops">Create workshop</Link>
        </Button>
      }
    >
      <StatGrid>
        <StatCard icon={CalendarDays} label="Workshops" value={workshops.length} hint={`${upcoming.length} upcoming`} />
        <StatCard icon={Users} label="Learners" value={totalSeats} hint="Seats booked" />
        <StatCard icon={Star} label="Rating" value={(profile?.rating ?? 0).toFixed(1)} hint={`${profile?.rating_count ?? 0} reviews`} />
        <StatCard icon={IndianRupee} label="Earnings" value={formatCurrency(earnings)} hint="Gross to date" />
      </StatGrid>

      <section className="space-y-4">
        <SectionHeading title="Upcoming sessions" />
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming sessions"
            description="Publish a new workshop to start teaching learners near you."
            action={
              <Button asChild variant="hero" size="sm">
                <Link to="/dashboard/mentor/workshops">Create workshop</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((w) => (
              <div key={w.id} className="surface-card flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(w.starts_at)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {w.seats_taken}/{w.capacity} seats · {formatCurrency(Number(w.price))}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">{w.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading title="Recent registrations" />
        {participants.length === 0 ? (
          <EmptyState icon={Users} title="No learners yet" description="Registrations will appear here." />
        ) : (
          <div className="surface-card divide-y divide-border">
            {participants.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.profile?.full_name ?? "Learner"}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.workshop?.title}</p>
                </div>
                <Badge variant="secondary" className="capitalize">{p.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
