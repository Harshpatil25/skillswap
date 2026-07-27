import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Briefcase, GraduationCap, Map as MapIcon, Search, SlidersHorizontal, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { InternshipCard } from "@/components/cards/internship-card";
import { MentorCard } from "@/components/cards/mentor-card";
import { WorkshopCard } from "@/components/cards/workshop-card";
import { CardGridSkeleton, EmptyState } from "@/components/common/states";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MapView, type MapPoint } from "@/components/map/map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  useInternships,
  useMentors,
  useSkills,
  useWorkshops,
  type InternshipWithCompany,
  type WorkshopWithHost,
} from "@/hooks/use-skillswap-data";
import { rankByRecommendation, type LearnerContext } from "@/lib/ai/recommendations";

const searchSchema = z.object({
  q: z.string().optional(),
  tab: z.enum(["workshops", "mentors", "internships"]).optional(),
});

export const Route = createFileRoute("/explore")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Explore workshops, mentors & internships near you — SkillSwap" },
      {
        name: "description",
        content:
          "Search hyperlocal workshops, mentors and MSME internships. Filter by skill, distance, mode and price, and see everything on a live map.",
      },
      { property: "og:title", content: "Explore SkillSwap near you" },
      {
        property: "og:description",
        content: "Filter hyperlocal workshops, mentors and internships by skill, distance and price.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const search = useSearch({ from: "/explore" });
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [term, setTerm] = useState(search.q ?? "");
  const [tab, setTab] = useState(search.tab ?? "workshops");
  const [mode, setMode] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number[]>([5000]);
  const [radius, setRadius] = useState<number[]>([60]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [sort, setSort] = useState<"match" | "soonest" | "price" | "rating">("match");

  const { data: workshops, isLoading: loadingWorkshops } = useWorkshops();
  const { data: mentors, isLoading: loadingMentors } = useMentors();
  const { data: internships, isLoading: loadingInternships } = useInternships();
  const { data: skills } = useSkills();

  const learner: LearnerContext = useMemo(
    () => ({
      interests: term ? [term] : ["skills"],
      latitude: profile?.latitude ?? null,
      longitude: profile?.longitude ?? null,
      city: profile?.city ?? null,
    }),
    [term, profile?.latitude, profile?.longitude, profile?.city],
  );

  const categories = useMemo(
    () => Array.from(new Set((skills ?? []).map((s) => s.category))).sort(),
    [skills],
  );

  const matchText = (haystack: Array<string | null | undefined>) =>
    !term || haystack.filter(Boolean).join(" ").toLowerCase().includes(term.toLowerCase());

  const rankedWorkshops = useMemo(() => {
    const filtered = (workshops ?? []).filter((w) => {
      if (!matchText([w.title, w.description, w.skill?.name, w.city, w.host?.full_name])) return false;
      if (mode !== "all" && w.mode !== mode) return false;
      if (category !== "all" && w.skill?.category !== category) return false;
      if (freeOnly && Number(w.price) > 0) return false;
      if (Number(w.price) > maxPrice[0]) return false;
      return true;
    });

    const ranked = rankByRecommendation(
      learner,
      filtered.map((w) => ({
        ...w,
        skillName: w.skill?.name,
        category: w.skill?.category,
        ratingCount: w.host?.rating ? 20 : 0,
        rating: w.host?.rating ?? null,
        seatsTaken: w.seats_taken,
        startsAt: w.starts_at,
        views: w.views_count ?? 0,
      })),
    ) as Array<WorkshopWithHost & { match: { score: number; distanceKm: number | null } }>;

    const withinRadius = ranked.filter(
      (w) => w.match.distanceKm == null || w.match.distanceKm <= radius[0],
    );

    const list = withinRadius.length || radius[0] < 60 ? withinRadius : ranked;

    return [...list].sort((a, b) => {
      if (sort === "soonest") return a.starts_at.localeCompare(b.starts_at);
      if (sort === "price") return Number(a.price) - Number(b.price);
      if (sort === "rating") return Number(b.host?.rating ?? 0) - Number(a.host?.rating ?? 0);
      return b.match.score - a.match.score;
    });
  }, [workshops, term, mode, category, freeOnly, maxPrice, radius, sort, learner]);

  const rankedMentors = useMemo(() => {
    const filtered = (mentors ?? []).filter((m) =>
      matchText([
        m.full_name,
        m.headline,
        m.bio,
        m.city,
        ...(m.user_skills ?? []).map((s) => s.skill?.name),
      ]),
    );
    return rankByRecommendation(
      learner,
      filtered.map((m) => ({
        ...m,
        skillName: (m.user_skills ?? []).map((s) => s.skill?.name).join(" "),
        ratingCount: m.rating_count,
        rating: m.rating,
      })),
    );
  }, [mentors, term, learner]);

  const rankedInternships = useMemo(() => {
    const filtered = (internships ?? []).filter((i) =>
      matchText([i.title, i.description, i.location, i.company?.name, ...(i.skills_required ?? [])]),
    );
    return rankByRecommendation(
      learner,
      filtered.map((i) => ({
        ...i,
        skillName: (i.skills_required ?? []).join(" "),
        title: i.title,
      })),
    ) as Array<InternshipWithCompany & { match: { score: number; distanceKm: number | null } }>;
  }, [internships, term, learner]);

  const mapPoints: MapPoint[] = useMemo(() => {
    if (tab === "workshops") {
      return rankedWorkshops
        .filter((w) => w.latitude != null && w.longitude != null)
        .map((w) => ({
          id: w.id,
          latitude: Number(w.latitude),
          longitude: Number(w.longitude),
          title: w.title,
          subtitle: w.city ?? undefined,
        }));
    }
    if (tab === "mentors") {
      return rankedMentors
        .filter((m) => m.latitude != null && m.longitude != null)
        .map((m) => ({
          id: m.id,
          latitude: Number(m.latitude),
          longitude: Number(m.longitude),
          title: m.full_name,
          subtitle: m.headline ?? undefined,
        }));
    }
    return rankedInternships
      .filter((i) => i.latitude != null && i.longitude != null)
      .map((i) => ({
        id: i.id,
        latitude: Number(i.latitude),
        longitude: Number(i.longitude),
        title: i.title,
        subtitle: i.company?.name ?? undefined,
      }));
  }, [tab, rankedWorkshops, rankedMentors, rankedInternships]);

  const updateTab = (next: string) => {
    setTab(next as typeof tab);
    navigate({ to: "/explore", search: { q: term || undefined, tab: next as typeof tab } });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <section className="border-b border-border bg-card">
          <div className="container-page py-8">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Explore what's happening near you
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Results are ranked by skill match, distance, mentor rating and popularity.
            </p>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search skills, mentors, companies…"
                  className="h-12 rounded-full pl-11"
                  aria-label="Search"
                />
              </div>
              <Tabs value={tab} onValueChange={updateTab}>
                <TabsList>
                  <TabsTrigger value="workshops">
                    <GraduationCap className="mr-1.5 size-4" /> Workshops
                  </TabsTrigger>
                  <TabsTrigger value="mentors">
                    <Users className="mr-1.5 size-4" /> Mentors
                  </TabsTrigger>
                  <TabsTrigger value="internships">
                    <Briefcase className="mr-1.5 size-4" /> Internships
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant={showMap ? "default" : "outline"}
                onClick={() => setShowMap((v) => !v)}
              >
                <MapIcon /> {showMap ? "Hide map" : "Map view"}
              </Button>
            </div>
          </div>
        </section>

        <div className="container-page grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
          {/* FILTERS */}
          <aside className="surface-card h-fit space-y-6 p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="size-4" /> Filters
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any format</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Max price · ₹{maxPrice[0]}</Label>
              <Slider value={maxPrice} onValueChange={setMaxPrice} max={5000} step={100} />
            </div>

            <div className="space-y-3">
              <Label>Within {radius[0]} km</Label>
              <Slider value={radius} onValueChange={setRadius} min={2} max={60} step={2} />
              {!profile?.latitude && (
                <p className="text-xs text-muted-foreground">
                  Add your location in settings for accurate distances.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="free-only">Free sessions only</Label>
              <Switch id="free-only" checked={freeOnly} onCheckedChange={setFreeOnly} />
            </div>

            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best match</SelectItem>
                  <SelectItem value="soonest">Starting soonest</SelectItem>
                  <SelectItem value="price">Lowest price</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Popular skills</Label>
              <div className="flex flex-wrap gap-2">
                {(skills ?? []).slice(0, 6).map((s) => (
                  <button key={s.id} type="button" onClick={() => setTerm(s.name)}>
                    <Badge variant="secondary" className="cursor-pointer rounded-full">
                      {s.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <section>
            {showMap && mapPoints.length > 0 && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-border">
                <MapView points={mapPoints} height={340} />
              </div>
            )}

            {tab === "workshops" && (
              <ResultBlock
                loading={loadingWorkshops}
                count={rankedWorkshops.length}
                emptyTitle="No workshops match your filters"
              >
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {rankedWorkshops.map((w, i) => (
                    <WorkshopCard key={w.id} workshop={w} index={i} />
                  ))}
                </div>
              </ResultBlock>
            )}

            {tab === "mentors" && (
              <ResultBlock
                loading={loadingMentors}
                count={rankedMentors.length}
                emptyTitle="No mentors match your search"
              >
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {rankedMentors.map((m, i) => (
                    <MentorCard key={m.id} mentor={m} index={i} />
                  ))}
                </div>
              </ResultBlock>
            )}

            {tab === "internships" && (
              <ResultBlock
                loading={loadingInternships}
                count={rankedInternships.length}
                emptyTitle="No internships match your search"
              >
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {rankedInternships.map((i, index) => (
                    <InternshipCard key={i.id} internship={i} index={index} />
                  ))}
                </div>
              </ResultBlock>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultBlock({
  loading,
  count,
  emptyTitle,
  children,
}: {
  loading: boolean;
  count: number;
  emptyTitle: string;
  children: React.ReactNode;
}) {
  if (loading) return <CardGridSkeleton />;
  if (!count) {
    return (
      <EmptyState
        icon={Search}
        title={emptyTitle}
        description="Try widening your distance radius, clearing the price filter or searching a different skill."
        action={
          <Button variant="outline" asChild>
            <Link to="/explore">Reset search</Link>
          </Button>
        }
      />
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{count} results</p>
      {children}
    </>
  );
}
