import { LogLevel } from "../config";
export declare class Logger {
    private readonly category;
    private readonly level;
    private readonly threshold;
    constructor(category: string, level: LogLevel);
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    info(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    private write;
}
export declare const createLogger: (category: string, level?: LogLevel) => Logger;
//# sourceMappingURL=logger.d.ts.map