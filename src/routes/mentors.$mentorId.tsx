import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Globe, Languages, MapPin, Star } from "lucide-react";

import { WorkshopCard } from "@/components/cards/workshop-card";
import { CardGridSkeleton } from "@/components/common/states";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MapView } from "@/components/map/map-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMentor, useMentorReviews, useWorkshops } from "@/hooks/use-skillswap-data";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/mentors/$mentorId")({
  head: () => ({
    meta: [
      { title: "Mentor profile — SkillSwap" },
      {
        name: "description",
        content: "View a SkillSwap mentor's skills, ratings, reviews and upcoming local workshops.",
      },
      { property: "og:title", content: "Mentor profile — SkillSwap" },
      { property: "og:description", content: "Skills, reviews and upcoming workshops from a local mentor." },
    ],
  }),
  component: MentorProfilePage,
});

function MentorProfilePage() {
  const { mentorId } = Route.useParams();
  const { data: mentor, isLoading } = useMentor(mentorId);
  const { data: reviews } = useMentorReviews(mentorId);
  const { data: workshops, isLoading: loadingWorkshops } = useWorkshops();

  const hosted = (workshops ?? []).filter((w) => w.host_profile_id === mentorId);

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

  if (!mentor) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Mentor not found</h1>
          <Button asChild>
            <Link to="/mentors">Back to mentors</Link>
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const skills = (mentor.user_skills ?? []).map((s) => s.skill?.name).filter(Boolean) as string[];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <section className="border-b border-border bg-card">
          <div className="container-page flex flex-col gap-6 py-12 sm:flex-row sm:items-start">
            <Avatar className="size-24 border border-border">
              <AvatarImage src={mentor.avatar_url ?? undefined} alt={mentor.full_name} />
              <AvatarFallback className="text-xl">{initials(mentor.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight">{mentor.full_name}</h1>
              <p className="mt-1 text-muted-foreground">{mentor.headline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star className="size-4 fill-warning text-warning" />
                  {Number(mentor.rating).toFixed(1)} · {mentor.rating_count} reviews
                </span>
                {mentor.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" /> {mentor.city}
                  </span>
                )}
                {(mentor.languages ?? []).length > 0 && (
                  <span className="flex items-center gap-1">
                    <Languages className="size-4" /> {(mentor.languages ?? []).join(", ")}
                  </span>
                )}
                {mentor.website_url && (
                  <a
                    href={mentor.website_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="size-4" /> Website
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/explore" search={{ q: mentor.full_name, tab: "workshops" }}>
                See their sessions
              </Link>
            </Button>
          </div>
        </section>

        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <div className="surface-card p-7">
              <h2 className="text-lg font-bold">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {mentor.bio ?? "This mentor hasn't added a bio yet."}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold">Upcoming workshops</h2>
              <div className="mt-4">
                {loadingWorkshops ? (
                  <CardGridSkeleton count={2} />
                ) : hosted.length === 0 ? (
                  <p className="surface-card p-6 text-sm text-muted-foreground">
                    No upcoming sessions listed right now.
                  </p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {hosted.map((w, i) => (
                      <WorkshopCard key={w.id} workshop={w} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="surface-card p-7">
              <h2 className="text-lg font-bold">Reviews</h2>
              <div className="mt-4 space-y-5">
                {(reviews ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                )}
                {(reviews ?? []).map((review) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={review.reviewer?.avatar_url ?? undefined} alt="" />
                        <AvatarFallback>{initials(review.reviewer?.full_name ?? "SkillSwap")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{review.reviewer?.full_name ?? "Learner"}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3 fill-warning text-warning" /> {review.rating} ·{" "}
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                    <Separator className="mt-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-card p-6">
              <h3 className="text-sm font-bold">Availability</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                {mentor.availability ?? "Flexible — message to arrange"}
              </p>
            </div>
            {mentor.latitude != null && mentor.longitude != null && (
              <div className="overflow-hidden rounded-2xl border border-border">
                <MapView
                  height={240}
                  zoom={13}
                  points={[
                    {
                      id: mentor.id,
                      latitude: Number(mentor.latitude),
                      longitude: Number(mentor.longitude),
                      title: mentor.full_name,
                      subtitle: mentor.city ?? undefined,
                    },
                  ]}
                />
              </div>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
