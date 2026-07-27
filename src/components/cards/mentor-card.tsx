import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Profile, Skill } from "@/hooks/use-skillswap-data";
import { initials } from "@/lib/format";

type MentorLike = Profile & {
  user_skills?: Array<{ skill: Pick<Skill, "id" | "name" | "category"> | null }>;
  match?: { score: number; distanceKm: number | null };
};

export function MentorCard({ mentor, index = 0 }: { mentor: MentorLike; index?: number }) {
  const skills = (mentor.user_skills ?? []).map((s) => s.skill?.name).filter(Boolean).slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="surface-card flex h-full flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <Avatar className="size-14 border border-border">
          <AvatarImage src={mentor.avatar_url ?? undefined} alt={mentor.full_name} />
          <AvatarFallback>{initials(mentor.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold">{mentor.full_name}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">{mentor.headline}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="size-3.5 fill-warning text-warning" />
              {Number(mentor.rating).toFixed(1)} ({mentor.rating_count})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {mentor.city ?? "Remote"}
              {mentor.match?.distanceKm != null && ` · ${mentor.match.distanceKm.toFixed(1)} km`}
            </span>
          </div>
        </div>
        {mentor.match && (
          <Badge className="bg-primary-soft text-primary">{mentor.match.score}%</Badge>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{mentor.bio}</p>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="rounded-full font-medium">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">
          <strong className="text-foreground">{mentor.experience_years}</strong> yrs experience
        </span>
        <Button size="sm" variant="soft" asChild>
          <Link to="/mentors/$mentorId" params={{ mentorId: mentor.id }}>
            View profile
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
