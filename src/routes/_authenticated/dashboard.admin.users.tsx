import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAllProfiles } from "@/hooks/use-skillswap-data";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & roles | SkillSwap admin" },
      { name: "description", content: "Browse every SkillSwap member with their role, city and join date." },
      { property: "og:title", content: "Users & roles | SkillSwap admin" },
      { property: "og:description", content: "Browse SkillSwap members." },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const { data: profiles = [] } = useAllProfiles();
  const [term, setTerm] = useState("");

  const filtered = profiles.filter((p) =>
    [p.full_name, p.city, p.role].filter(Boolean).join(" ").toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <DashboardShell title="Users & roles" description="Every member on the platform">
      <Input
        placeholder="Search by name, city or role"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="surface-card divide-y divide-border">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <Avatar className="size-9">
              <AvatarImage src={p.avatar_url ?? undefined} alt="" />
              <AvatarFallback>{initials(p.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {p.city ?? "—"} · joined {formatDate(p.created_at)}
              </p>
            </div>
            <Badge variant="secondary" className="capitalize">{p.role}</Badge>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
