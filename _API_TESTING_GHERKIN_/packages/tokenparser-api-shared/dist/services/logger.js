"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.Logger = void 0;
const config_1 = require("../config");
const LEVEL_PRIORITY = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
};
const consoleMethodForLevel = {
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug ? console.debug.bind(console) : console.log.bind(console),
};
class Logger {
    constructor(category, level) {
        this.category = category;
        this.level = level;
        this.threshold = LEVEL_PRIORITY[level];
    }
    error(...args) {
        this.write("error", args);
    }
    warn(...args) {
        this.write("warn", args);
    }
    info(...args) {
        this.write("info", args);
    }
    debug(...args) {
        this.write("debug", args);
    }
    write(level, args) {
        if (LEVEL_PRIORITY[level] > this.threshold || this.threshold === LEVEL_PRIORITY.silent) {
            return;
        }
        const method = consoleMethodForLevel[level];
        method(`[${level.toUpperCase()}] [${this.category}]`, ...args);
    }
}
exports.Logger = Logger;
const defaultLevel = (0, config_1.getConfig)().logging.level;
const createLogger = (category, level = defaultLevel) => new Logger(category, level);
exports.createLogger = createLogger;
