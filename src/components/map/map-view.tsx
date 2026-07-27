import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
}

const LeafletMap = lazy(() => import("./leaflet-map"));

export function MapView({
  points,
  height = 320,
  zoom = 12,
}: {
  points: MapPoint[];
  height?: number;
  zoom?: number;
}) {
  const fallback = <Skeleton style={{ height }} className="w-full rounded-2xl" />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <LeafletMap points={points} height={height} zoom={zoom} />
      </Suspense>
    </ClientOnly>
  );
}
