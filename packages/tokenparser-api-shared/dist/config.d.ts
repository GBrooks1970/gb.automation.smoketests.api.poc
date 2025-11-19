export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";
export interface LoggingConfig {
    level: LogLevel;
}
export interface AppConfig {
    logging: LoggingConfig;
}
export declare const getConfig: (overrides?: Partial<AppConfig>) => AppConfig;
//# sourceMappingURL=config.d.ts.map