import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LocateFixed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Profile & settings | SkillSwap" },
      { name: "description", content: "Update your SkillSwap profile, headline, location and hourly rate." },
      { property: "og:title", content: "Profile & settings | SkillSwap" },
      { property: "og:description", content: "Manage your SkillSwap profile." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    bio: "",
    city: "",
    avatar_url: "",
    hourly_rate: "0",
    experience_years: "0",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      city: profile.city ?? "",
      avatar_url: profile.avatar_url ?? "",
      hourly_rate: String(profile.hourly_rate ?? 0),
      experience_years: String(profile.experience_years ?? 0),
      latitude: profile.latitude != null ? String(profile.latitude) : "",
      longitude: profile.longitude != null ? String(profile.longitude) : "",
    });
  }, [profile]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude.toFixed(6));
        set("longitude", pos.coords.longitude.toFixed(6));
        toast.success("Location captured");
      },
      () => toast.error("Could not get your location"),
    );
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile not ready");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim(),
          headline: form.headline || null,
          bio: form.bio || null,
          city: form.city || null,
          avatar_url: form.avatar_url || null,
          hourly_rate: Number(form.hourly_rate) || 0,
          experience_years: Number(form.experience_years) || 0,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardShell title="Profile & settings" description="Keep your details and location up to date">
      <div className="surface-card grid max-w-2xl gap-4 p-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" value={form.headline} onChange={(e) => set("headline", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input id="avatar" value={form.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Hourly rate (₹)</Label>
            <Input id="rate" type="number" min="0" value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exp">Experience (years)</Label>
            <Input
              id="exp"
              type="number"
              min="0"
              value={form.experience_years}
              onChange={(e) => set("experience_years", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input id="lng" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={useMyLocation}>
            <LocateFixed /> Use my location
          </Button>
          <Button variant="hero" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
