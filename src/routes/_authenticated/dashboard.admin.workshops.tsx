import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAllWorkshops } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/admin/workshops")({
  head: () => ({
    meta: [
      { title: "Moderate workshops | SkillSwap admin" },
      { name: "description", content: "Approve, reject and monitor every workshop listed on SkillSwap." },
      { property: "og:title", content: "Moderate workshops | SkillSwap admin" },
      { property: "og:description", content: "Workshop moderation queue." },
    ],
  }),
  component: AdminWorkshops,
});

function AdminWorkshops() {
  const queryClient = useQueryClient();
  const { data: workshops = [] } = useAllWorkshops();

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("workshops")
        .update({ status: status as never })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workshop updated");
      queryClient.invalidateQueries({ queryKey: ["admin-workshops"] });
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell title="Workshops" description="Moderation queue and live listings">
      <div className="surface-card divide-y divide-border">
        {workshops.map((w) => (
          <div key={w.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{w.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {w.host?.full_name ?? "Host"} · {formatDateTime(w.starts_at)}
              </p>
            </div>
            <Badge variant="secondary" className="capitalize">{w.status}</Badge>
            <div className="flex gap-2">
              {w.status !== "approved" && (
                <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: w.id, status: "approved" })}>
                  Approve
                </Button>
              )}
              {w.status !== "rejected" && (
                <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: w.id, status: "rejected" })}>
                  Reject
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
