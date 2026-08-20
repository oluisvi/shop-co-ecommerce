import "dotenv/config";

type RuntimeEnv = {
  DATABASE_URL: string;
  PORT: number;
  FRONTEND_URL: string;
  FRONTEND_URLS: string[];
  NODE_ENV: "development" | "test" | "production";
};

function required(source: NodeJS.ProcessEnv, key: string) {
  const value = source[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export function validateEnv(source: NodeJS.ProcessEnv): RuntimeEnv {
  const nodeEnv = (source.NODE_ENV ?? "development") as RuntimeEnv["NODE_ENV"];
  if (!(["development", "test", "production"] as const).includes(nodeEnv)) {
    throw new Error("NODE_ENV must be development, test, or production");
  }

  const databaseUrl = required(source, "DATABASE_URL");
  if (!/^postgres(?:ql)?:\/\//.test(databaseUrl)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }

  const frontendValue = source.FRONTEND_URLS?.trim() || required(source, "FRONTEND_URL");
  const frontendOrigins = frontendValue.split(",").map((value) => value.trim()).filter(Boolean).map((value) => {
    if (value.includes("*")) throw new Error("FRONTEND_URLS must not contain wildcard origins");
    try { return new URL(value).origin; } catch { throw new Error("FRONTEND_URLS must contain valid absolute URLs"); }
  });

  const port = Number(source.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return {
    DATABASE_URL: databaseUrl,
    PORT: port,
    FRONTEND_URL: frontendOrigins[0],
    FRONTEND_URLS: frontendOrigins,
    NODE_ENV: nodeEnv,
  };
}

let cached: RuntimeEnv | null = null;

export function getEnv() {
  cached ??= validateEnv(process.env);
  return cached;
}
