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
