import http from "http";
import { LogLevel } from "./config";
export interface CreateTokenParserServerOptions {
    logLevel?: LogLevel;
}
export interface StartTokenParserServerOptions extends CreateTokenParserServerOptions {
    port?: number;
}
export declare const createTokenParserServer: (options?: CreateTokenParserServerOptions) => {
    app: import("express-serve-static-core").Express;
    logger: import("./services/logger").Logger;
};
export declare const startTokenParserServer: (options?: StartTokenParserServerOptions) => Promise<http.Server>;
