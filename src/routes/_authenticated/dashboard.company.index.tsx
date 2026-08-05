import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Building2, Eye, Users } from "lucide-react";

import { CardGridSkeleton, EmptyState, SectionHeading } from "@/components/common/states";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyApplicants, useCompanyInternships, useMyCompany } from "@/hooks/use-skillswap-data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/company/")({
  head: () => ({
    meta: [
      { title: "Company dashboard | SkillSwap" },
      { name: "description", content: "Manage internships, applicants and your MSME profile on SkillSwap." },
      { property: "og:title", content: "Company dashboard | SkillSwap" },
      { property: "og:description", content: "Hire local talent through SkillSwap." },
    ],
  }),
  component: CompanyDashboard,
});

function CompanyDashboard() {
  const { profile } = useAuth();
  const { data: company, isLoading } = useMyCompany(profile?.id);
  const { data: internships = [] } = useCompanyInternships(company?.id);
  const { data: applicants = [] } = useCompanyApplicants(company?.id);

  const openRoles = internships.filter((i) => i.is_open).length;

  return (
    <DashboardShell
      title={company?.name ?? "Your company"}
      description="Hire and train local talent"
      actions={
        <Button size="sm" variant="hero" asChild>
          <Link to="/dashboard/company/internships">Post internship</Link>
        </Button>
      }
    >
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : !company ? (
        <EmptyState
          icon={Building2}
          title="Set up your company"
          description="Add your company profile to start posting internships."
          action={
            <Button asChild variant="hero" size="sm">
              <Link to="/dashboard/company/profile">Create company profile</Link>
            </Button>
          }
        />
      ) : (
        <>
          <StatGrid>
            <StatCard icon={Briefcase} label="Internships" value={internships.length} hint={`${openRoles} open`} />
            <StatCard icon={Users} label="Applicants" value={applicants.length} hint="All time" />
            <StatCard
              icon={Eye}
              label="Shortlisted"
              value={applicants.filter((a) => a.status === "shortlisted").length}
              hint="In review"
            />
            <StatCard
              icon={Building2}
              label="Verification"
              value={company.verified ? "Verified" : "Pending"}
              hint={company.city ?? "—"}
            />
          </StatGrid>

          <section className="space-y-4">
            <SectionHeading title="Recent applicants" />
            {applicants.length === 0 ? (
              <EmptyState icon={Users} title="No applicants yet" description="Applications will appear here." />
            ) : (
              <div className="surface-card divide-y divide-border">
                {applicants.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.profile?.full_name ?? "Applicant"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.internship?.title} · {formatDate(a.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </DashboardShell>
  );
}
