import { createFileRoute } from "@tanstack/react-router";

import { StatCard, StatGrid } from "@/components/common/stat-card";
import { SectionHeading } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Progress } from "@/components/ui/progress";
import { BarChart3, MapPin, Percent, Users } from "lucide-react";
import { useAllProfiles, useAllWorkshops } from "@/hooks/use-skillswap-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports | SkillSwap admin" },
      { name: "description", content: "Category demand, city coverage and seat fill-rate analytics for SkillSwap." },
      { property: "og:title", content: "Reports | SkillSwap admin" },
      { property: "og:description", content: "Marketplace analytics for SkillSwap." },
    ],
  }),
  component: AdminReports,
});

function AdminReports() {
  const { data: workshops = [] } = useAllWorkshops();
  const { data: profiles = [] } = useAllProfiles();

  const byCategory = Object.entries(
    workshops.reduce<Record<string, number>>((acc, w) => {
      const key = w.skill?.category ?? w.category ?? "General";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const byCity = Object.entries(
    profiles.reduce<Record<string, number>>((acc, p) => {
      const key = p.city ?? "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const capacity = workshops.reduce((s, w) => s + w.capacity, 0);
  const taken = workshops.reduce((s, w) => s + w.seats_taken, 0);
  const fill = capacity ? Math.round((taken / capacity) * 100) : 0;
  const maxCat = byCategory[0]?.[1] ?? 1;
  const maxCity = byCity[0]?.[1] ?? 1;

  return (
    <DashboardShell title="Reports" description="Demand, coverage and conversion">
      <StatGrid>
        <StatCard icon={BarChart3} label="Workshops" value={workshops.length} />
        <StatCard icon={Users} label="Members" value={profiles.length} />
        <StatCard icon={Percent} label="Seat fill" value={`${fill}%`} hint={`${taken}/${capacity} seats`} />
        <StatCard icon={MapPin} label="Cities" value={byCity.length} />
      </StatGrid>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card space-y-4 p-6">
          <SectionHeading title="Top categories" />
          {byCategory.slice(0, 6).map(([name, count]) => (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <Progress value={(count / maxCat) * 100} />
            </div>
          ))}
        </div>
        <div className="surface-card space-y-4 p-6">
          <SectionHeading title="Top cities" />
          {byCity.slice(0, 6).map(([name, count]) => (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <Progress value={(count / maxCity) * 100} />
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
