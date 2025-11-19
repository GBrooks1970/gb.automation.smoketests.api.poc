"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.buildAppConfig = void 0;
const LOG_LEVELS = ["silent", "error", "warn", "info", "debug"];
const resolveLogLevel = (value) => {
    if (!value) {
        return "debug";
    }
    const normalised = value.trim().toLowerCase();
    if (LOG_LEVELS.includes(normalised)) {
        return normalised;
    }
    return "debug";
};
const readEnv = (key) => {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
        return process.env[key];
    }
    if (typeof window !== "undefined" && window.Cypress) {
        return window.Cypress?.env(key);
    }
    return undefined;
};
const buildAppConfig = (overrides) => ({
    logging: {
        level: overrides?.logging?.level ?? resolveLogLevel(readEnv("TOKENPARSER_LOG_LEVEL")),
    },
});
exports.buildAppConfig = buildAppConfig;
let cachedConfig;
const getConfig = () => {
    if (!cachedConfig) {
        cachedConfig = (0, exports.buildAppConfig)();
    }
    return cachedConfig;
};
exports.getConfig = getConfig;
