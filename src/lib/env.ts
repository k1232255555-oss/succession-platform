const optionalServiceKeys = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_BILLING_ENABLED",
  "STRIPE_STANDARD_PRICE_ID",
  "STRIPE_PREMIUM_PRICE_ID",
  "STRIPE_ENTERPRISE_PRICE_ID",
  "OPENAI_API_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
] as const;

export function getEnvValue(key: string) {
  return process.env[key]?.trim() ?? "";
}

export function hasEnvValue(key: string) {
  return Boolean(getEnvValue(key));
}

export function getSafeAppUrl() {
  const rawUrl = getEnvValue("NEXT_PUBLIC_APP_URL");

  if (!rawUrl) {
    return "http://localhost:3000";
  }

  try {
    const url = new URL(rawUrl);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.origin;
    }
  } catch {
    return "http://localhost:3000";
  }

  return "http://localhost:3000";
}

export function getPublicEnvStatus() {
  return {
    required: {
      DATABASE_URL: hasEnvValue("DATABASE_URL"),
      NEXT_PUBLIC_APP_URL: hasEnvValue("NEXT_PUBLIC_APP_URL"),
    },
    productionGate: {
      BASIC_AUTH_USER: hasEnvValue("BASIC_AUTH_USER"),
      BASIC_AUTH_PASSWORD: hasEnvValue("BASIC_AUTH_PASSWORD"),
      ALLOW_BOOTSTRAP_ADMIN:
        getEnvValue("ALLOW_BOOTSTRAP_ADMIN") === "true" ? "enabled" : "disabled",
    },
    optionalServices: Object.fromEntries(
      optionalServiceKeys.map((key) => [key, hasEnvValue(key)]),
    ),
  };
}
