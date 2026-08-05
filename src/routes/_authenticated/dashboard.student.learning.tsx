import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { CardGridSkeleton, EmptyState, SectionHeading } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useMyApplications, useMyRegistrations } from "@/hooks/use-skillswap-data";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/student/learning")({
  head: () => ({
    meta: [
      { title: "My learning | SkillSwap" },
      { name: "description", content: "All your enrolled workshops, progress and internship applications." },
      { property: "og:title", content: "My learning | SkillSwap" },
      { property: "og:description", content: "Track enrolled workshops and applications." },
    ],
  }),
  component: MyLearning,
});

function MyLearning() {
  const { profile } = useAuth();
  const { data: registrations = [], isLoading } = useMyRegistrations(profile?.id);
  const { data: applications = [] } = useMyApplications(profile?.id);

  return (
    <DashboardShell title="My learning" description="Workshops you joined and roles you applied to">
      <Tabs defaultValue="workshops" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workshops">Workshops ({registrations.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="workshops" className="space-y-4">
          {isLoading ? (
            <CardGridSkeleton count={4} />
          ) : registrations.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nothing here yet"
              description="Reserve a seat in a hyperlocal workshop to start learning."
              action={
                <Button asChild variant="hero" size="sm">
                  <Link to="/explore">Explore workshops</Link>
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
                        {r.workshop?.starts_at ? formatDateTime(r.workshop.starts_at) : "—"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{r.status}</Badge>
                  </div>
                  <Progress value={r.progress ?? 0} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{r.attended ? "Attended" : "Not attended yet"}</span>
                    {r.workshop?.slug && (
                      <Link
                        to="/workshops/$slug"
                        params={{ slug: r.workshop.slug }}
                        className="font-medium text-primary hover:underline"
                      >
                        View workshop
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <SectionHeading title="Internship applications" />
          {applications.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No applications"
              description="Apply to local MSME internships to gain real experience."
              action={
                <Button asChild variant="hero" size="sm">
                  <Link to="/internships">Browse internships</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {applications.map((a) => (
                <div key={a.id} className="surface-card flex items-start justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.internship?.title ?? "Internship"}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.internship?.company?.name ?? "Company"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Applied {formatDate(a.created_at)}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
