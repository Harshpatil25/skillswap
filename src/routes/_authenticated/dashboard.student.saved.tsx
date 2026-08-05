import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";

import { WorkshopCard } from "@/components/cards/workshop-card";
import { CardGridSkeleton, EmptyState } from "@/components/common/states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSavedWorkshops } from "@/hooks/use-skillswap-data";

export const Route = createFileRoute("/_authenticated/dashboard/student/saved")({
  head: () => ({
    meta: [
      { title: "Saved workshops | SkillSwap" },
      { name: "description", content: "Workshops you bookmarked for later on SkillSwap." },
      { property: "og:title", content: "Saved workshops | SkillSwap" },
      { property: "og:description", content: "Your bookmarked hyperlocal workshops." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { profile } = useAuth();
  const { data: saved = [], isLoading } = useSavedWorkshops(profile?.id);

  return (
    <DashboardShell title="Saved" description="Workshops you bookmarked for later">
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved workshops"
          description="Tap the bookmark icon on any workshop to keep it here."
          action={
            <Button asChild variant="hero" size="sm">
              <Link to="/explore">Explore workshops</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((w, i) => (
            <WorkshopCard key={w.id} workshop={w} index={i} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
