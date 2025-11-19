"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const server_1 = require("./api/server");
const parseArg = (name) => {
    const prefix = `--${name}=`;
    const arg = process_1.default.argv.slice(2).find((value) => value.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : undefined;
};
const port = Number(parseArg("port") ?? process_1.default.env.PORT ?? 3000);
(0, server_1.startTokenParserServer)({ port })
    .then(() => {
    // Keep process alive until interrupted
})
    .catch((error) => {
    console.error("Failed to start shared Token Parser API", error);
    process_1.default.exit(1);
});
