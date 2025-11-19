export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

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
