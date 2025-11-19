export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

export interface LoggingConfig {
  level: LogLevel;
}

export interface AppConfig {
  logging: LoggingConfig;
}

const LOG_LEVELS: LogLevel[] = ["silent", "error", "warn", "info", "debug"];

type CypressEnv = {
  env: (key: string) => string | undefined;
};

const readEnv = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  if (
    typeof window !== "undefined" &&
    (window as typeof window & { Cypress?: CypressEnv }).Cypress
  ) {
    const cypress = (window as typeof window & { Cypress?: CypressEnv }).Cypress;
    return cypress?.env(key);
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

const config: AppConfig = {
  logging: {
    level: resolveLogLevel(readEnv("TOKENPARSER_LOG_LEVEL")),
  },
};

export const getConfig = (): AppConfig => config;
