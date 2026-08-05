import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CardGridSkeleton, EmptyState } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyInternships, useMyCompany } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/company/internships")({
  head: () => ({
    meta: [
      { title: "Manage internships | SkillSwap" },
      { name: "description", content: "Post and manage internship openings for local talent." },
      { property: "og:title", content: "Manage internships | SkillSwap" },
      { property: "og:description", content: "Post internships on SkillSwap." },
    ],
  }),
  component: CompanyInternships,
});

function CompanyInternships() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: company } = useMyCompany(profile?.id);
  const { data: internships = [], isLoading } = useCompanyInternships(company?.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    mode: "offline",
    stipend: "5000",
    openings: "1",
    duration_months: "3",
    location: "",
    skills: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: async () => {
      if (!company?.id) throw new Error("Create your company profile first");
      if (!form.title.trim()) throw new Error("Title is required");
      const { error } = await supabase.from("internships").insert({
        company_id: company.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        mode: form.mode as "online" | "offline" | "hybrid",
        stipend: Number(form.stipend) || 0,
        openings: Number(form.openings) || 1,
        duration_months: Number(form.duration_months) || 1,
        location: form.location || company.city,
        latitude: company.latitude,
        longitude: company.longitude,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Internship published");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["company-internships"] });
      queryClient.invalidateQueries({ queryKey: ["internships"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleOpen = useMutation({
    mutationFn: async ({ id, is_open }: { id: string; is_open: boolean }) => {
      const { error } = await supabase.from("internships").update({ is_open }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-internships"] });
      queryClient.invalidateQueries({ queryKey: ["internships"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell
      title="Internships"
      description="Publish roles and track openings"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="hero">
              <Plus /> New internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Post an internship</DialogTitle>
              <DialogDescription>Reach skilled learners in your city.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Role title</Label>
                <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Mode</Label>
                  <Select value={form.mode} onValueChange={(v) => set("mode", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stipend">Monthly stipend (₹)</Label>
                  <Input id="stipend" type="number" min="0" value={form.stipend} onChange={(e) => set("stipend", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openings">Openings</Label>
                  <Input id="openings" type="number" min="1" value={form.openings} onChange={(e) => set("openings", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="months">Duration (months)</Label>
                  <Input
                    id="months"
                    type="number"
                    min="1"
                    value={form.duration_months}
                    onChange={(e) => set("duration_months", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loc">Location</Label>
                <Input id="loc" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" value={form.skills} onChange={(e) => set("skills", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="hero" onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? "Publishing…" : "Publish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : internships.length === 0 ? (
        <EmptyState icon={Briefcase} title="No internships posted" description="Publish your first role to reach local talent." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {internships.map((i) => (
            <div key={i.id} className="surface-card space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-semibold">{i.title}</p>
                <Badge variant="secondary" className="capitalize">{i.mode}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(Number(i.stipend))}/month · {i.openings} openings · {i.duration_months} months
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {i.applications?.[0]?.count ?? 0} applicants
                </span>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Open
                  <Switch
                    checked={i.is_open}
                    onCheckedChange={(v) => toggleOpen.mutate({ id: i.id, is_open: v })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
