// Environment variable validation
// Optional vars use defaults - app won't crash if AdSense/rate-limit vars are missing

const requiredServerVars = [
  "OPENAI_API_KEY",
] as const;

const optionalServerVars = {
  SUPABASE_SERVICE_ROLE_KEY: "",
  STRIPE_SECRET_KEY: "",
  STRIPE_WEBHOOK_SECRET: "",
  STRIPE_PRICE_ID_BASIC: "",
  STRIPE_PRICE_ID_PRO: "",
  RATE_LIMIT_MAX_REQUESTS: "10",
  RATE_LIMIT_WINDOW_MS: "60000",
  ALLOWED_ORIGINS: "",
} as const;

const optionalClientVars = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_NAME: "Transcrify",
  NEXT_PUBLIC_APP_SLUG: "transcrify",
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: "",
  NEXT_PUBLIC_ADS_ENABLED: "false",
} as const;

function getServerEnv() {
  // Validate required vars exist
  for (const key of requiredServerVars) {
    if (!process.env[key]) {
      console.warn(`[env] Missing required server env var: ${key}`);
    }
  }

  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? optionalServerVars.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? optionalServerVars.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? optionalServerVars.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID_BASIC: process.env.STRIPE_PRICE_ID_BASIC ?? optionalServerVars.STRIPE_PRICE_ID_BASIC,
    STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO ?? optionalServerVars.STRIPE_PRICE_ID_PRO,
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? optionalServerVars.RATE_LIMIT_MAX_REQUESTS, 10),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? optionalServerVars.RATE_LIMIT_WINDOW_MS, 10),
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? optionalServerVars.ALLOWED_ORIGINS,
  };
}

function getClientEnv() {
  return {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? optionalClientVars.NEXT_PUBLIC_APP_URL,
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? optionalClientVars.NEXT_PUBLIC_APP_NAME,
    APP_SLUG: process.env.NEXT_PUBLIC_APP_SLUG ?? optionalClientVars.NEXT_PUBLIC_APP_SLUG,
    ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? optionalClientVars.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  };
}

export const serverEnv = getServerEnv();
export const clientEnv = getClientEnv();
