import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Workshop = Tables<"workshops">;
export type Profile = Tables<"profiles">;
export type Skill = Tables<"skills">;
export type Internship = Tables<"internships">;
export type Company = Tables<"companies">;

export type WorkshopWithHost = Workshop & {
  host: Pick<Profile, "id" | "full_name" | "avatar_url" | "headline" | "rating"> | null;
  skill: Pick<Skill, "id" | "name" | "category"> | null;
};

const WORKSHOP_SELECT =
  "*, host:profiles!workshops_host_profile_id_fkey(id, full_name, avatar_url, headline, rating), skill:skills(id, name, category)";

export function useWorkshops(options?: { limit?: number }) {
  return useQuery({
    queryKey: ["workshops", options?.limit ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("workshops")
        .select(WORKSHOP_SELECT)
        .eq("status", "approved")
        .order("starts_at", { ascending: true });
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as WorkshopWithHost[];
    },
  });
}

export function useWorkshop(slug: string) {
  return useQuery({
    queryKey: ["workshop", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshops")
        .select(WORKSHOP_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as WorkshopWithHost | null;
    },
  });
}

export function useMentors(options?: { limit?: number }) {
  return useQuery({
    queryKey: ["mentors", options?.limit ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*, user_skills(skill:skills(id, name, category))")
        .eq("role", "mentor")
        .order("rating", { ascending: false });
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Array<
        Profile & { user_skills: Array<{ skill: Pick<Skill, "id" | "name" | "category"> | null }> }
      >;
    },
  });
}

export function useMentor(id: string) {
  return useQuery({
    queryKey: ["mentor", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_skills(skill:skills(id, name, category))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as
        | (Profile & { user_skills: Array<{ skill: Pick<Skill, "id" | "name" | "category"> | null }> })
        | null;
    },
  });
}

export function useMentorReviews(mentorId: string) {
  return useQuery({
    queryKey: ["mentor-reviews", mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_reviews")
        .select("*, reviewer:profiles!mentor_reviews_reviewer_profile_id_fkey(full_name, avatar_url)")
        .eq("mentor_profile_id", mentorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<
        Tables<"mentor_reviews"> & { reviewer: { full_name: string; avatar_url: string | null } | null }
      >;
    },
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("popularity", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type InternshipWithCompany = Internship & { company: Company | null };

export function useInternships() {
  return useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internships")
        .select("*, company:companies(*)")
        .eq("is_open", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InternshipWithCompany[];
    },
  });
}

export function useMyRegistrations(profileId?: string | null) {
  return useQuery({
    queryKey: ["registrations", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*, workshop:workshops(*)")
        .eq("profile_id", profileId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<
        Tables<"workshop_registrations"> & { workshop: Workshop | null }
      >;
    },
  });
}

export function useMyFavorites(profileId?: string | null) {
  return useQuery({
    queryKey: ["favorites", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("profile_id", profileId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useNotifications(profileId?: string | null) {
  return useQuery({
    queryKey: ["notifications", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", profileId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCertificates(profileId?: string | null) {
  return useQuery({
    queryKey: ["certificates", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*, workshop:workshops(title, slug)")
        .eq("profile_id", profileId!)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<
        Tables<"certificates"> & { workshop: { title: string; slug: string } | null }
      >;
    },
  });
}

export function useMyWorkshops(profileId?: string | null) {
  return useQuery({
    queryKey: ["my-workshops", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshops")
        .select("*, registrations:workshop_registrations(count)")
        .eq("host_profile_id", profileId!)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Array<Workshop & { registrations: { count: number }[] }>;
    },
  });
}

export function useMyCompany(profileId?: string | null) {
  return useQuery({
    queryKey: ["my-company", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_profile_id", profileId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCompanyInternships(companyId?: string | null) {
  return useQuery({
    queryKey: ["company-internships", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internships")
        .select("*, applications:internship_applications(count)")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<Internship & { applications: { count: number }[] }>;
    },
  });
}

export function useMyApplications(profileId?: string | null) {
  return useQuery({
    queryKey: ["my-applications", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_applications")
        .select("*, internship:internships(*, company:companies(name, logo_url))")
        .eq("profile_id", profileId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<
        Tables<"internship_applications"> & {
          internship: (Internship & { company: { name: string; logo_url: string | null } | null }) | null;
        }
      >;
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [learners, mentors, workshops, companies] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "mentor"),
        supabase.from("workshops").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("companies").select("id", { count: "exact", head: true }),
      ]);
      return {
        learners: learners.count ?? 0,
        mentors: mentors.count ?? 0,
        workshops: workshops.count ?? 0,
        companies: companies.count ?? 0,
      };
    },
  });
}
