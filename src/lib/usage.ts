import { supabaseAdmin } from "@/lib/supabase/admin";

const ANONYMOUS_DAILY_LIMIT = 3;

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  basic: 30,
  pro: Infinity,
};

export async function checkAnonymousUsage(
  ip: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = ANONYMOUS_DAILY_LIMIT;

  const { data } = await supabaseAdmin
    .from("anonymous_usage")
    .select("count")
    .eq("ip_address", ip)
    .eq("usage_date", new Date().toISOString().split("T")[0])
    .single();

  const used = data?.count ?? 0;

  return { allowed: used < limit, used, limit };
}

export async function checkUserUsage(
  userId: string
): Promise<{ allowed: boolean; used: number; limit: number; plan: string }> {
  // Get user's plan
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_status, daily_limit")
    .eq("id", userId)
    .single();

  const plan = profile?.subscription_status ?? "free";
  const limit = PLAN_LIMITS[plan] ?? profile?.daily_limit ?? 5;

  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: -1, plan };
  }

  const { data } = await supabaseAdmin
    .from("user_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("usage_date", new Date().toISOString().split("T")[0])
    .single();

  const used = data?.count ?? 0;

  return { allowed: used < limit, used, limit, plan };
}

export async function incrementUsage(
  identifier: { type: "anonymous"; ip: string } | { type: "user"; userId: string }
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  if (identifier.type === "anonymous") {
    // Upsert anonymous usage
    const { data: existing } = await supabaseAdmin
      .from("anonymous_usage")
      .select("id, count")
      .eq("ip_address", identifier.ip)
      .eq("usage_date", today)
      .single();

    if (existing) {
      await supabaseAdmin
        .from("anonymous_usage")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin
        .from("anonymous_usage")
        .insert({ ip_address: identifier.ip, usage_date: today, count: 1 });
    }
  } else {
    // Upsert user usage
    const { data: existing } = await supabaseAdmin
      .from("user_usage")
      .select("id, count")
      .eq("user_id", identifier.userId)
      .eq("usage_date", today)
      .single();

    if (existing) {
      await supabaseAdmin
        .from("user_usage")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin
        .from("user_usage")
        .insert({ user_id: identifier.userId, usage_date: today, count: 1 });
    }
  }
}

export async function saveTranscription(
  userId: string,
  data: {
    url: string;
    title?: string;
    ai_title?: string;
    author?: string;
    full_text: string;
    paragraphs?: string[];
    segments?: { start: number; end: number; text: string }[];
  }
): Promise<void> {
  await supabaseAdmin.from("transcription_history").insert({
    user_id: userId,
    url: data.url,
    title: data.title || null,
    ai_title: data.ai_title || null,
    author: data.author || null,
    full_text: data.full_text,
    paragraphs: data.paragraphs || null,
    segments: data.segments || null,
  });
}
