import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";

import { CardGridSkeleton, EmptyState } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCertificates } from "@/hooks/use-skillswap-data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/student/certificates")({
  head: () => ({
    meta: [
      { title: "Certificates | SkillSwap" },
      { name: "description", content: "Download and verify the certificates you earned on SkillSwap." },
      { property: "og:title", content: "Certificates | SkillSwap" },
      { property: "og:description", content: "Your verified SkillSwap certificates." },
    ],
  }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const { profile } = useAuth();
  const { data: certificates = [], isLoading } = useCertificates(profile?.id);

  return (
    <DashboardShell title="Certificates" description="Verified proof of the skills you completed">
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a workshop and attend the session to earn a verified certificate."
          action={
            <Button asChild variant="hero" size="sm">
              <Link to="/explore">Find a workshop</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {certificates.map((c) => (
            <div key={c.id} className="surface-card space-y-4 p-6">
              <span className="gradient-primary flex size-11 items-center justify-center rounded-2xl text-primary-foreground">
                <Award className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{c.workshop?.title ?? "SkillSwap certificate"}</p>
                <p className="text-xs text-muted-foreground">Issued {formatDate(c.issued_at)}</p>
              </div>
              <p className="rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                {c.code}
              </p>
              {c.certificate_url && (
                <Button asChild size="sm" variant="outline" className="w-full">
                  <a href={c.certificate_url} target="_blank" rel="noreferrer">
                    <Download /> Download
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
