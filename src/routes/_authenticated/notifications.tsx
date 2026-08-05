import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { CardGridSkeleton, EmptyState } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | SkillSwap" },
      { name: "description", content: "Workshop reminders, application updates and platform alerts." },
      { property: "og:title", content: "Notifications | SkillSwap" },
      { property: "og:description", content: "Your SkillSwap activity feed." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications(profile?.id);

  const markAll = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("profile_id", profile.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("All caught up");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardShell
      title="Notifications"
      description={unread ? `${unread} unread` : "You're all caught up"}
      actions={
        unread > 0 ? (
          <Button size="sm" variant="outline" onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Updates about your activity will appear here." />
      ) : (
        <div className="surface-card divide-y divide-border">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-4">
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${n.is_read ? "bg-muted-foreground/40" : "bg-primary"}`}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
