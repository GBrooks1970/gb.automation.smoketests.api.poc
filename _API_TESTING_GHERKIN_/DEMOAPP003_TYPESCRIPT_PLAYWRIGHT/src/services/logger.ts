import { getConfig, LogLevel } from "../config";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

type LogMethod = (...args: unknown[]) => void;

const consoleMethodForLevel: Record<Exclude<LogLevel, "silent">, LogMethod> = {
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.info.bind(console),
  debug: console.debug ? console.debug.bind(console) : console.log.bind(console),
};

export class Logger {
  private readonly threshold: number;

  constructor(
    private readonly category: string,
    private readonly level: LogLevel,
  ) {
    this.threshold = LEVEL_PRIORITY[level];
  }

  error(...args: unknown[]): void {
    this.write("error", args);
  }

  warn(...args: unknown[]): void {
    this.write("warn", args);
  }

  info(...args: unknown[]): void {
    this.write("info", args);
  }

  debug(...args: unknown[]): void {
    this.write("debug", args);
  }

  private write(level: Exclude<LogLevel, "silent">, args: unknown[]): void {
    if (LEVEL_PRIORITY[level] > this.threshold || this.threshold === LEVEL_PRIORITY.silent) {
      return;
    }
    const method = consoleMethodForLevel[level];
    method(`[${level.toUpperCase()}] [${this.category}]`, ...args);
  }
}

const defaultLevel = getConfig().logging.level;

export const createLogger = (category: string, level: LogLevel = defaultLevel): Logger =>
  new Logger(category, level);
