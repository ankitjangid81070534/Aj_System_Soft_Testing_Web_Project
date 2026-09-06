import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { toTeamTeaser, type TeamTeaser } from "@/lib/data/mappers";

/**
 * Public team access. Only published + active + public members come back
 * (RLS + explicit filters). No fallback people exist and none may be
 * invented — an empty result simply hides the section.
 */
export const getPublishedTeam = cache(async (limit = 12): Promise<TeamTeaser[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("team_members")
      .select(
        "id, name, role_title, short_bio, profile_photo_url, skills, linkedin_url, github_url, portfolio_url, email, public_email",
      )
      .eq("status", "published")
      .eq("is_active", true)
      .eq("is_public", true)
      .order("sort_order")
      .limit(limit);
    if (error || !data || data.length === 0) return [];
    return data.map(toTeamTeaser);
  } catch {
    return [];
  }
});
