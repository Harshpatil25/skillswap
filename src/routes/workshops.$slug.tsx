import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock,
  Languages,
  MapPin,
  Share2,
  Signal,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { CardGridSkeleton } from "@/components/common/states";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MapView } from "@/components/map/map-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useMyRegistrations, useWorkshop } from "@/hooks/use-skillswap-data";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDateTime, initials } from "@/lib/format";

export const Route = createFileRoute("/workshops/$slug")({
  head: () => ({
    meta: [
      { title: "Workshop details — SkillSwap" },
      {
        name: "description",
        content:
          "See the agenda, mentor, location and available seats for this hyperlocal SkillSwap workshop, then reserve your spot.",
      },
      { property: "og:title", content: "Workshop details — SkillSwap" },
      { property: "og:description", content: "Reserve your seat in a hyperlocal skill workshop." },
    ],
  }),
  component: WorkshopDetailPage,
});

function WorkshopDetailPage() {
  const { slug } = Route.useParams();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: workshop, isLoading } = useWorkshop(slug);
  const { data: registrations } = useMyRegistrations(profile?.id);

  const registered = (registrations ?? []).some((r) => r.workshop?.slug === slug);

  const register = useMutation({
    mutationFn: async () => {
      if (!workshop || !profile) throw new Error("Sign in to reserve a seat");
      const { error } = await supabase
        .from("workshop_registrations")
        .insert({ workshop_id: workshop.id, profile_id: profile.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Seat reserved!", { description: "Find it in your dashboard." });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["workshop", slug] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container-page py-16">
          <CardGridSkeleton count={3} />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Workshop not found</h1>
          <Button asChild>
            <Link to="/explore">Browse workshops</Link>
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const seatsLeft = Math.max(0, workshop.capacity - workshop.seats_taken);
  const fill = Math.round((workshop.seats_taken / Math.max(1, workshop.capacity)) * 100);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <div className="relative h-64 w-full overflow-hidden bg-muted sm:h-80">
          {workshop.banner_url && (
            <img
              src={workshop.banner_url}
              alt={workshop.title}
              className="size-full object-cover"
            />
          )}
        </div>

        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="capitalize">{workshop.mode}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {workshop.level}
                </Badge>
                {workshop.skill?.name && <Badge variant="secondary">{workshop.skill.name}</Badge>}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {workshop.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" /> {formatDateTime(workshop.starts_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" /> {workshop.duration_minutes} min
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {workshop.city ?? "Online"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Languages className="size-4" /> {workshop.language}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-warning text-warning" />
                  {Number(workshop.rating).toFixed(1)} ({workshop.rating_count})
                </span>
              </div>
            </div>

            <div className="surface-card p-7">
              <h2 className="text-lg font-bold">About this session</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {workshop.description ?? "Details coming soon."}
              </p>
            </div>

            {workshop.host && (
              <div className="surface-card p-7">
                <h2 className="text-lg font-bold">Your mentor</h2>
                <div className="mt-4 flex items-center gap-4">
                  <Avatar className="size-14">
                    <AvatarImage src={workshop.host.avatar_url ?? undefined} alt={workshop.host.full_name} />
                    <AvatarFallback>{initials(workshop.host.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold">{workshop.host.full_name}</p>
                    <p className="text-sm text-muted-foreground">{workshop.host.headline}</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/mentors/$mentorId" params={{ mentorId: workshop.host.id }}>
                      View profile
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {workshop.latitude != null && workshop.longitude != null && (
              <div className="surface-card overflow-hidden">
                <div className="p-6 pb-3">
                  <h2 className="text-lg font-bold">Where it happens</h2>
                  <p className="text-sm text-muted-foreground">{workshop.address ?? workshop.city}</p>
                </div>
                <MapView
                  height={280}
                  zoom={14}
                  points={[
                    {
                      id: workshop.id,
                      latitude: Number(workshop.latitude),
                      longitude: Number(workshop.longitude),
                      title: workshop.title,
                      subtitle: workshop.address ?? undefined,
                    },
                  ]}
                />
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="surface-card space-y-5 p-6">
              <div>
                <p className="text-3xl font-extrabold">{formatCurrency(Number(workshop.price))}</p>
                <p className="text-sm text-muted-foreground">per learner</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4" /> {workshop.seats_taken}/{workshop.capacity} seats
                  </span>
                  <span className="font-semibold">{seatsLeft} left</span>
                </div>
                <Progress value={fill} className="mt-2" />
              </div>

              <Separator />

              {registered ? (
                <Button className="w-full" variant="success" disabled>
                  <Ticket /> You're registered
                </Button>
              ) : user ? (
                <Button
                  className="w-full"
                  variant="hero"
                  disabled={register.isPending || seatsLeft === 0}
                  onClick={() => register.mutate()}
                >
                  <Ticket /> {seatsLeft === 0 ? "Sold out" : "Reserve my seat"}
                </Button>
              ) : (
                <Button className="w-full" variant="hero" asChild>
                  <Link to="/auth" search={{ mode: "signin" }}>
                    Sign in to register
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copied");
                }}
              >
                <Share2 /> Share workshop
              </Button>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Signal className="size-3.5" /> Certificate issued on completion.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
