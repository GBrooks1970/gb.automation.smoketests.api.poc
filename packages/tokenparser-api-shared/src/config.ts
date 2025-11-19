export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

type CypressGlobal = {
  env: (key: string) => string | undefined;
};

declare const Cypress: CypressGlobal | undefined;

export interface LoggingConfig {
  level: LogLevel;
}

export interface AppConfig {
  logging: LoggingConfig;
}

const LOG_LEVELS: LogLevel[] = ["silent", "error", "warn", "info", "debug"];

const readEnv = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  if (typeof window !== "undefined") {
    const maybeCypress = (window as typeof window & { Cypress?: CypressGlobal }).Cypress;
    if (maybeCypress) {
      return maybeCypress.env(key);
    }
  }

  return undefined;
};

const resolveLogLevel = (value: string | undefined): LogLevel => {
  if (!value) {
    return "debug";
  }

  const normalised = value.trim().toLowerCase();
  if (LOG_LEVELS.includes(normalised as LogLevel)) {
    return normalised as LogLevel;
  }

  return "debug";
};

const createConfig = (overrides?: Partial<AppConfig>): AppConfig => ({
  logging: {
    level: overrides?.logging?.level ?? resolveLogLevel(readEnv("TOKENPARSER_LOG_LEVEL")),
  },
});

let cachedConfig: AppConfig | undefined;

export const getConfig = (overrides?: Partial<AppConfig>): AppConfig => {
  if (overrides) {
    return createConfig(overrides);
  }

  if (!cachedConfig) {
    cachedConfig = createConfig();
  }

  return cachedConfig;
};
