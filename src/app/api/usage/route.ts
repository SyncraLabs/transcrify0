import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkAnonymousUsage, checkUserUsage } from "@/lib/usage";

export async function GET(request: NextRequest) {
  // Try to get user session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const usage = await checkUserUsage(user.id);
    return NextResponse.json({
      authenticated: true,
      plan: usage.plan,
      used: usage.used,
      limit: usage.limit,
      remaining: usage.limit === -1 ? -1 : usage.limit - usage.used,
    });
  }

  // Anonymous
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const usage = await checkAnonymousUsage(ip);
  return NextResponse.json({
    authenticated: false,
    plan: "anonymous",
    used: usage.used,
    limit: usage.limit,
    remaining: usage.limit - usage.used,
  });
}
