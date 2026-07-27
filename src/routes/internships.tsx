import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InternshipCard } from "@/components/cards/internship-card";
import { CardGridSkeleton, EmptyState, SectionHeading } from "@/components/common/states";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useInternships, useMyApplications } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/internships")({
  head: () => ({
    meta: [
      { title: "Local MSME internships — SkillSwap" },
      {
        name: "description",
        content:
          "Apply to paid internships at small businesses in your city. Real work, local commutes, skills that count.",
      },
      { property: "og:title", content: "Local MSME internships — SkillSwap" },
      { property: "og:description", content: "Paid internships at small businesses near you." },
    ],
  }),
  component: InternshipsPage,
});

function InternshipsPage() {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: internships, isLoading } = useInternships();
  const { data: applications } = useMyApplications(profile?.id);
  const [term, setTerm] = useState("");

  const apply = useMutation({
    mutationFn: async (internshipId: string) => {
      if (!profile) throw new Error("Sign in to apply");
      const { error } = await supabase
        .from("internship_applications")
        .insert({ internship_id: internshipId, profile_id: profile.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application sent");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const appliedIds = new Set((applications ?? []).map((a) => a.internship_id));

  const filtered = (internships ?? []).filter((i) =>
    [i.title, i.description, i.location, i.company?.name, ...(i.skills ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-surface border-b border-border">
          <div className="container-page py-14">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Internships with local businesses
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              MSMEs in your city hiring learners for real, paid work — short commutes included.
            </p>
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search role, company or skill"
              className="mt-6 h-12 max-w-md rounded-full bg-card"
              aria-label="Search internships"
            />
          </div>
        </section>

        <section className="container-page py-12">
          <SectionHeading title={`${filtered.length} open roles`} />
          <div className="mt-8">
            {isLoading ? (
              <CardGridSkeleton count={6} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No internships found"
                description="Try another skill or check back soon — new roles are posted weekly."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((internship, index) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    index={index}
                    applied={appliedIds.has(internship.id)}
                    onApply={
                      user
                        ? () => apply.mutate(internship.id)
                        : () => toast.error("Sign in to apply for internships")
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
