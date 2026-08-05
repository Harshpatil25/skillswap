import { createFileRoute } from "@tanstack/react-router";
import { Building2, GraduationCap, Shield, Users } from "lucide-react";

import { StatCard, StatGrid } from "@/components/common/stat-card";
import { SectionHeading } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { useAllProfiles, useAllWorkshops, usePlatformStats } from "@/hooks/use-skillswap-data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | SkillSwap" },
      { name: "description", content: "Platform-wide metrics, moderation and user management for SkillSwap." },
      { property: "og:title", content: "Admin dashboard | SkillSwap" },
      { property: "og:description", content: "Moderate and monitor the SkillSwap marketplace." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = usePlatformStats();
  const { data: profiles = [] } = useAllProfiles();
  const { data: workshops = [] } = useAllWorkshops();

  const pending = workshops.filter((w) => w.status === "pending");

  return (
    <DashboardShell title="Admin overview" description="Health of the SkillSwap marketplace">
      <StatGrid>
        <StatCard icon={Users} label="Learners" value={stats?.learners ?? 0} />
        <StatCard icon={GraduationCap} label="Mentors" value={stats?.mentors ?? 0} />
        <StatCard icon={Shield} label="Live workshops" value={stats?.workshops ?? 0} hint={`${pending.length} pending`} />
        <StatCard icon={Building2} label="Companies" value={stats?.companies ?? 0} />
      </StatGrid>

      <section className="space-y-4">
        <SectionHeading title="Newest members" />
        <div className="surface-card divide-y divide-border">
          {profiles.slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.city ?? "—"} · joined {formatDate(p.created_at)}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">{p.role}</Badge>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
