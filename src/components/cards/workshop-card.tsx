import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { WorkshopWithHost } from "@/hooks/use-skillswap-data";
import { formatCurrency, formatDateTime } from "@/lib/format";

interface Props {
  workshop: WorkshopWithHost & { match?: { score: number; distanceKm: number | null } };
  index?: number;
}

export function WorkshopCard({ workshop, index = 0 }: Props) {
  const seatsLeft = Math.max(0, workshop.capacity - workshop.seats_taken);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="surface-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <Link to="/workshops/$slug" params={{ slug: workshop.slug }} className="block">
        <div className="relative h-44 overflow-hidden bg-muted">
          {workshop.banner_url && (
            <img
              src={workshop.banner_url}
              alt={workshop.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge className="bg-card text-foreground capitalize shadow-soft">{workshop.mode}</Badge>
            {workshop.match && (
              <Badge className="bg-primary text-primary-foreground shadow-soft">
                {workshop.match.score}% match
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary">
            {workshop.category}
          </span>
          <span className="capitalize">{workshop.level}</span>
        </div>

        <Link to="/workshops/$slug" params={{ slug: workshop.slug }}>
          <h3 className="line-clamp-2 text-base font-bold leading-snug transition-colors group-hover:text-primary">
            {workshop.title}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-muted-foreground">{workshop.description}</p>

        <div className="mt-auto space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {formatDateTime(workshop.starts_at)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span className="truncate">
              {workshop.city ?? "Online"}
              {workshop.match?.distanceKm != null && ` · ${workshop.match.distanceKm.toFixed(1)} km`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="size-4 fill-warning text-warning" />
              {workshop.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="size-4" />
              {seatsLeft} left
            </span>
          </div>
          <span className="text-base font-bold text-primary">{formatCurrency(Number(workshop.price))}</span>
        </div>
      </div>
    </motion.article>
  );
}
