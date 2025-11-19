export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

export interface LoggingConfig {
  level: LogLevel;
}

export interface AppConfig {
  logging: LoggingConfig;
}

const LOG_LEVELS: LogLevel[] = ["silent", "error", "warn", "info", "debug"];

const resolveLogLevel = (value?: string): LogLevel => {
  if (!value) {
    return "debug";
  }

  const normalised = value.trim().toLowerCase();
  if (LOG_LEVELS.includes(normalised as LogLevel)) {
    return normalised as LogLevel;
  }

  return "debug";
};

const readEnv = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  if (typeof window !== "undefined" && (window as typeof window & { Cypress?: { env(key: string): string | undefined } }).Cypress) {
    return (window as typeof window & { Cypress?: { env(key: string): string | undefined } }).Cypress?.env(key);
  }

  return undefined;
};

export const buildAppConfig = (overrides?: Partial<AppConfig>): AppConfig => ({
  logging: {
    level: overrides?.logging?.level ?? resolveLogLevel(readEnv("TOKENPARSER_LOG_LEVEL")),
  },
});

let cachedConfig: AppConfig | undefined;

export const getConfig = (): AppConfig => {
  if (!cachedConfig) {
    cachedConfig = buildAppConfig();
  }
  return cachedConfig;
};
