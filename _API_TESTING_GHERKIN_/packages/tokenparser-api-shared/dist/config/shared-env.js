"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSharedEnvLoaded = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
let sharedEnvLoaded = false;
const resolveSharedEnvPath = () => {
    const candidates = [
        path_1.default.resolve(__dirname, "..", ".env.demoapp_ts_api"),
        path_1.default.resolve(__dirname, "..", "..", ".env.demoapp_ts_api"),
        path_1.default.resolve(__dirname, "..", "..", "..", ".env.demoapp_ts_api"),
        path_1.default.resolve(process.cwd(), ".env.demoapp_ts_api"),
        path_1.default.resolve(process.cwd(), "..", ".env.demoapp_ts_api"),
    ];
    return candidates.find((candidate) => fs_1.default.existsSync(candidate));
};
const ensureSharedEnvLoaded = () => {
    if (sharedEnvLoaded) {
        return;
    }
    const envPath = resolveSharedEnvPath();
    if (envPath) {
        (0, dotenv_1.config)({ path: envPath });
    }
    sharedEnvLoaded = true;
};
exports.ensureSharedEnvLoaded = ensureSharedEnvLoaded;
