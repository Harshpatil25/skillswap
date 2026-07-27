/**
 * SkillSwap recommendation engine.
 *
 * Pure client-side JavaScript heuristics — no external AI calls.
 * Recommendation Score = 40% skill match + 25% distance + 20% rating + 15% popularity.
 */

export interface GeoPoint {
  latitude?: number | null;
  longitude?: number | null;
}

export interface ScoreInput extends GeoPoint {
  category?: string | null;
  title?: string | null;
  skillName?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  seatsTaken?: number | null;
  capacity?: number | null;
  views?: number | null;
  startsAt?: string | null;
}

export interface LearnerContext extends GeoPoint {
  interests: string[];
  city?: string | null;
}

const EARTH_RADIUS_KM = 6371;
const MAX_RELEVANT_DISTANCE_KM = 60;

export function haversineKm(a: GeoPoint, b: GeoPoint): number | null {
  if (
    a.latitude == null ||
    a.longitude == null ||
    b.latitude == null ||
    b.longitude == null
  ) {
    return null;
  }
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function normalize(text?: string | null): string[] {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

/** 0..1 overlap between a learner's interests and an item's descriptors. */
export function skillMatchScore(interests: string[], item: ScoreInput): number {
  if (!interests.length) return 0.5;
  const haystack = new Set([
    ...normalize(item.title),
    ...normalize(item.category),
    ...normalize(item.skillName),
  ]);
  let hits = 0;
  for (const interest of interests) {
    const tokens = normalize(interest);
    if (tokens.some((token) => haystack.has(token))) hits += 1;
  }
  return Math.min(1, hits / Math.min(interests.length, 3));
}

/** 0..1 — closer is better; unknown distance is treated as neutral. */
export function distanceScore(learner: GeoPoint, item: GeoPoint): number {
  const km = haversineKm(learner, item);
  if (km == null) return 0.55;
  return Math.max(0, 1 - km / MAX_RELEVANT_DISTANCE_KM);
}

/** 0..1 rating quality with a light confidence weighting on review volume. */
export function ratingScore(item: ScoreInput): number {
  const rating = item.rating ?? 0;
  const count = item.ratingCount ?? 0;
  const confidence = Math.min(1, count / 50);
  return (rating / 5) * (0.6 + 0.4 * confidence);
}

/** 0..1 popularity from fill-rate and views. */
export function popularityScore(item: ScoreInput): number {
  const fill = item.capacity ? Math.min(1, (item.seatsTaken ?? 0) / item.capacity) : 0;
  const views = Math.min(1, (item.views ?? 0) / 2500);
  return 0.6 * fill + 0.4 * views;
}

export interface ScoreBreakdown {
  score: number;
  skill: number;
  distance: number;
  rating: number;
  popularity: number;
  distanceKm: number | null;
}

export function recommendationScore(learner: LearnerContext, item: ScoreInput): ScoreBreakdown {
  const skill = skillMatchScore(learner.interests, item);
  const distance = distanceScore(learner, item);
  const rating = ratingScore(item);
  const popularity = popularityScore(item);
  const score = 0.4 * skill + 0.25 * distance + 0.2 * rating + 0.15 * popularity;
  return {
    score: Math.round(score * 100),
    skill: Math.round(skill * 100),
    distance: Math.round(distance * 100),
    rating: Math.round(rating * 100),
    popularity: Math.round(popularity * 100),
    distanceKm: haversineKm(learner, item),
  };
}

export function rankByRecommendation<T extends ScoreInput>(
  learner: LearnerContext,
  items: T[],
): Array<T & { match: ScoreBreakdown }> {
  return items
    .map((item) => ({ ...item, match: recommendationScore(learner, item) }))
    .sort((a, b) => b.match.score - a.match.score);
}

/** Trending = popularity momentum weighted by rating and recency of the session. */
export function trendingScore(item: ScoreInput): number {
  const daysAway = item.startsAt
    ? Math.abs((new Date(item.startsAt).getTime() - Date.now()) / 86400000)
    : 30;
  const recency = Math.max(0.2, 1 - daysAway / 45);
  return Math.round((0.5 * popularityScore(item) + 0.3 * ratingScore(item) + 0.2 * recency) * 100);
}

export interface RoadmapStage {
  stage: string;
  focus: string;
  skills: string[];
  weeks: number;
}

/**
 * Deterministic career roadmap generator: maps a target track to staged skills,
 * pushing skills the learner already has to the end of each stage.
 */
export function buildCareerRoadmap(track: string, ownedSkills: string[] = []): RoadmapStage[] {
  const owned = new Set(ownedSkills.map((s) => s.toLowerCase()));
  const tracks: Record<string, RoadmapStage[]> = {
    "frontend-developer": [
      { stage: "Foundation", focus: "Web fundamentals", skills: ["Spoken English", "Excel Mastery", "UI/UX Design"], weeks: 4 },
      { stage: "Core craft", focus: "Build real interfaces", skills: ["React Development", "Mobile App Development"], weeks: 8 },
      { stage: "Job ready", focus: "Portfolio and interviews", skills: ["Resume Building", "Interview Preparation"], weeks: 4 },
    ],
    "data-analyst": [
      { stage: "Foundation", focus: "Numbers and tools", skills: ["Excel Mastery", "Python Programming"], weeks: 5 },
      { stage: "Core craft", focus: "Analyse and visualise", skills: ["Data Analytics", "Machine Learning"], weeks: 9 },
      { stage: "Job ready", focus: "Case studies and interviews", skills: ["Public Speaking", "Interview Preparation"], weeks: 4 },
    ],
    designer: [
      { stage: "Foundation", focus: "Visual basics", skills: ["Graphic Design", "Photography"], weeks: 4 },
      { stage: "Core craft", focus: "Product thinking", skills: ["UI/UX Design", "Content Writing"], weeks: 8 },
      { stage: "Job ready", focus: "Portfolio review", skills: ["Resume Building", "Public Speaking"], weeks: 3 },
    ],
    entrepreneur: [
      { stage: "Foundation", focus: "Money and market", skills: ["Financial Literacy", "Entrepreneurship"], weeks: 4 },
      { stage: "Core craft", focus: "Reach customers", skills: ["Digital Marketing", "E-commerce Selling"], weeks: 8 },
      { stage: "Scale", focus: "Tell your story", skills: ["Public Speaking", "Video Editing"], weeks: 4 },
    ],
  };

  const stages = tracks[track] ?? tracks["frontend-developer"];
  return stages.map((stage) => ({
    ...stage,
    skills: [...stage.skills].sort(
      (a, b) => Number(owned.has(a.toLowerCase())) - Number(owned.has(b.toLowerCase())),
    ),
  }));
}

export const CAREER_TRACKS = [
  { value: "frontend-developer", label: "Frontend Developer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "designer", label: "Product Designer" },
  { value: "entrepreneur", label: "Entrepreneur" },
];
