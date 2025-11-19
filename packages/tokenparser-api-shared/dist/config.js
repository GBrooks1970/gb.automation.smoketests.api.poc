"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const LOG_LEVELS = ["silent", "error", "warn", "info", "debug"];
const readEnv = (key) => {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
        return process.env[key];
    }
    if (typeof window !== "undefined") {
        const maybeCypress = window.Cypress;
        if (maybeCypress) {
            return maybeCypress.env(key);
        }
    }
    return undefined;
};
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
const createConfig = (overrides) => ({
    logging: {
        level: overrides?.logging?.level ?? resolveLogLevel(readEnv("TOKENPARSER_LOG_LEVEL")),
    },
});
let cachedConfig;
const getConfig = (overrides) => {
    if (overrides) {
        return createConfig(overrides);
    }
    if (!cachedConfig) {
        cachedConfig = createConfig();
    }
    return cachedConfig;
};
exports.getConfig = getConfig;
