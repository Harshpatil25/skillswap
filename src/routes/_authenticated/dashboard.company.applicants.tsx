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
import { useCompanyApplicants, useMyCompany } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/company/applicants")({
  head: () => ({
    meta: [
      { title: "Applicants | SkillSwap" },
      { name: "description", content: "Review, shortlist and hire applicants for your internships." },
      { property: "og:title", content: "Applicants | SkillSwap" },
      { property: "og:description", content: "Review internship applicants." },
    ],
  }),
  component: Applicants,
});

const NEXT: Record<string, string> = {
  applied: "shortlisted",
  shortlisted: "accepted",
};

function Applicants() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: company } = useMyCompany(profile?.id);
  const { data: applicants = [], isLoading } = useCompanyApplicants(company?.id);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("internship_applications")
        .update({ status: status as never })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application updated");
      queryClient.invalidateQueries({ queryKey: ["company-applicants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell title="Applicants" description="Review and move candidates through your pipeline">
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : applicants.length === 0 ? (
        <EmptyState icon={Users} title="No applicants yet" description="Applications will appear here." />
      ) : (
        <div className="surface-card divide-y divide-border">
          {applicants.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 p-4">
              <Avatar className="size-10">
                <AvatarImage src={a.profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{initials(a.profile?.full_name ?? "A")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.profile?.full_name ?? "Applicant"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.internship?.title} · applied {formatDate(a.created_at)}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">{a.status}</Badge>
              <div className="flex gap-2">
                {NEXT[a.status] && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: a.id, status: NEXT[a.status] })}
                  >
                    Move to {NEXT[a.status]}
                  </Button>
                )}
                {a.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
