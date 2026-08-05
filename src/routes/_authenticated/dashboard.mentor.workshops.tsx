import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMyWorkshops, useSkills } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/mentor/workshops")({
  head: () => ({
    meta: [
      { title: "My workshops | SkillSwap" },
      { name: "description", content: "Create, publish and manage the workshops you host on SkillSwap." },
      { property: "og:title", content: "My workshops | SkillSwap" },
      { property: "og:description", content: "Manage the workshops you host." },
    ],
  }),
  component: MentorWorkshops,
});

const slugify = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function MentorWorkshops() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: workshops = [], isLoading } = useMyWorkshops(profile?.id);
  const { data: skills = [] } = useSkills();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    skill_id: "",
    mode: "offline",
    level: "beginner",
    price: "0",
    capacity: "20",
    duration_minutes: "90",
    starts_at: "",
    city: profile?.city ?? "",
    address: "",
  });

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const create = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile not ready");
      if (!form.title.trim() || !form.starts_at) throw new Error("Title and date are required");
      const skill = skills.find((s) => s.id === form.skill_id);
      const { error } = await supabase.from("workshops").insert({
        title: form.title.trim(),
        slug: `${slugify(form.title)}-${Math.random().toString(36).slice(2, 7)}`,
        description: form.description.trim() || null,
        host_profile_id: profile.id,
        skill_id: form.skill_id || null,
        category: skill?.category ?? "General",
        mode: form.mode as "online" | "offline" | "hybrid",
        level: form.level,
        price: Number(form.price) || 0,
        capacity: Number(form.capacity) || 10,
        duration_minutes: Number(form.duration_minutes) || 60,
        starts_at: new Date(form.starts_at).toISOString(),
        city: form.city || null,
        address: form.address || null,
        latitude: profile.latitude,
        longitude: profile.longitude,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workshop submitted for review");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-workshops"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell
      title="My workshops"
      description="Create and manage the sessions you host"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="hero">
              <Plus /> New workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a workshop</DialogTitle>
              <DialogDescription>
                New workshops go live once an admin approves them.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Skill</Label>
                  <Select value={form.skill_id} onValueChange={(v) => set("skill_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={(v) => set("level", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="starts">Starts at</Label>
                  <Input
                    id="starts"
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => set("starts_at", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) => set("capacity", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    value={form.duration_minutes}
                    onChange={(e) => set("duration_minutes", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Venue address</Label>
                <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="hero" onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? "Publishing…" : "Publish workshop"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : workshops.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No workshops yet"
          description="Create your first workshop and start teaching learners in your neighbourhood."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {workshops.map((w) => (
            <div key={w.id} className="surface-card space-y-2 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-semibold">{w.title}</p>
                <Badge variant="secondary" className="capitalize">{w.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{formatDateTime(w.starts_at)}</p>
              <p className="text-sm text-muted-foreground">
                {w.seats_taken}/{w.capacity} seats · {formatCurrency(Number(w.price))} · {w.mode}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
