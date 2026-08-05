import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMyCompany } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/company/profile")({
  head: () => ({
    meta: [
      { title: "Company profile | SkillSwap" },
      { name: "description", content: "Manage your MSME company profile, location and branding on SkillSwap." },
      { property: "og:title", content: "Company profile | SkillSwap" },
      { property: "og:description", content: "Manage your company profile." },
    ],
  }),
  component: CompanyProfile,
});

function CompanyProfile() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: company } = useMyCompany(profile?.id);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    city: "",
    website: "",
    team_size: "",
    description: "",
    logo_url: "",
  });

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name ?? "",
      industry: company.industry ?? "",
      city: company.city ?? "",
      website: company.website ?? "",
      team_size: company.team_size ?? "",
      description: company.description ?? "",
      logo_url: company.logo_url ?? "",
    });
  }, [company]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile not ready");
      if (!form.name.trim()) throw new Error("Company name is required");
      const payload = {
        name: form.name.trim(),
        industry: form.industry || null,
        city: form.city || null,
        website: form.website || null,
        team_size: form.team_size || null,
        description: form.description || null,
        logo_url: form.logo_url || null,
        owner_profile_id: profile.id,
        latitude: profile.latitude,
        longitude: profile.longitude,
      };
      const { error } = company
        ? await supabase.from("companies").update(payload).eq("id", company.id)
        : await supabase.from("companies").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Company profile saved");
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell title="Company profile" description="How learners and applicants see your business">
      <div className="surface-card grid max-w-2xl gap-4 p-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="team">Team size</Label>
            <Input id="team" value={form.team_size} onChange={(e) => set("team_size", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logo">Logo URL</Label>
          <Input id="logo" value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="about">About</Label>
          <Textarea id="about" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <Button variant="hero" onClick={() => save.mutate()} disabled={save.isPending} className="w-fit">
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </DashboardShell>
  );
}
