export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";
export interface LoggingConfig {
    level: LogLevel;
}
export interface AppConfig {
    logging: LoggingConfig;
}
export declare const buildAppConfig: (overrides?: Partial<AppConfig>) => AppConfig;
export declare const getConfig: () => AppConfig;
