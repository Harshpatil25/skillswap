import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { CardGridSkeleton, EmptyState } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMentorParticipants } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/mentor/participants")({
  head: () => ({
    meta: [
      { title: "Participants | SkillSwap" },
      { name: "description", content: "See who registered for your workshops and mark attendance." },
      { property: "og:title", content: "Participants | SkillSwap" },
      { property: "og:description", content: "Manage learners registered to your workshops." },
    ],
  }),
  component: Participants,
});

function Participants() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: participants = [], isLoading } = useMentorParticipants(profile?.id);

  const markAttended = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ attended: true, status: "completed", progress: 100 })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Attendance updated");
      queryClient.invalidateQueries({ queryKey: ["mentor-participants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell title="Participants" description="Learners registered across your workshops">
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : participants.length === 0 ? (
        <EmptyState icon={Users} title="No participants yet" description="Registrations will show up here." />
      ) : (
        <div className="surface-card divide-y divide-border">
          {participants.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <Avatar className="size-10">
                <AvatarImage src={p.profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{initials(p.profile?.full_name ?? "L")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.profile?.full_name ?? "Learner"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.workshop?.title} · registered {formatDate(p.created_at)}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">{p.status}</Badge>
              {!p.attended && (
                <Button size="sm" variant="outline" onClick={() => markAttended.mutate(p.id)}>
                  Mark attended
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
