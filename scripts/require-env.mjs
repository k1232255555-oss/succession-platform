import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredKeys = process.argv.slice(2);
const envFiles = [".env", ".env.local"];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");

        if (separatorIndex === -1) {
          return [line, ""];
        }

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^["']|["']$/g, "");

        return [key, value];
      }),
  );
}

const fileEnv = envFiles.reduce(
  (env, file) => ({ ...env, ...parseEnvFile(resolve(process.cwd(), file)) }),
  {},
);

const missingKeys = requiredKeys.filter((key) => {
  const value = process.env[key] ?? fileEnv[key];

  return !value || value.trim().length === 0;
});

if (missingKeys.length > 0) {
  console.error(
    [
      `Missing required environment variable(s): ${missingKeys.join(", ")}`,
      "",
      "Vercel Sensitive Environment Variables cannot always be pulled back into .env files.",
      "Set the value manually in .env.local/.env, or run this command inside Vercel with the variable available.",
    ].join("\n"),
  );
  process.exit(1);
}
