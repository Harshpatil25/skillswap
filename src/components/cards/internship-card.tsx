import { motion } from "framer-motion";
import { Building2, Clock, IndianRupee, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InternshipWithCompany } from "@/hooks/use-skillswap-data";
import { formatDate } from "@/lib/format";

interface Props {
  internship: InternshipWithCompany & { match?: { score: number; distanceKm: number | null } };
  index?: number;
  onApply?: () => void;
  applied?: boolean;
  saved?: boolean;
  onSave?: () => void;
}

export function InternshipCard({ internship, index = 0, onApply, applied, saved, onSave }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="surface-card flex h-full flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {internship.company?.logo_url ? (
            <img src={internship.company.logo_url} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold">{internship.title}</h3>
          <p className="truncate text-sm text-muted-foreground">{internship.company?.name}</p>
        </div>
        {internship.match && (
          <Badge className="bg-primary-soft text-primary">{internship.match.score}%</Badge>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{internship.description}</p>

      <div className="flex flex-wrap gap-2">
        {internship.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="secondary" className="rounded-full font-medium">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <MapPin className="size-4" />
          {internship.location ?? "Remote"}
        </span>
        <span className="flex items-center gap-2 capitalize">
          <Clock className="size-4" />
          {internship.duration_months} months · {internship.mode}
        </span>
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <IndianRupee className="size-4" />
          {Number(internship.stipend).toLocaleString("en-IN")}/mo
        </span>
        {internship.deadline && <span>Apply by {formatDate(internship.deadline)}</span>}
      </div>

      <div className="mt-auto flex gap-2 border-t border-border pt-4">
        <Button size="sm" className="flex-1" onClick={onApply} disabled={applied}>
          {applied ? "Applied" : "Apply now"}
        </Button>
        {onSave && (
          <Button size="sm" variant="outline" onClick={onSave}>
            {saved ? "Saved" : "Save"}
          </Button>
        )}
      </div>
    </motion.article>
  );
}
