import http from "http";
import { AppConfig } from "../config";
declare const defaultSwaggerDefinition: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
    }[];
    paths: {
        "/alive": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        Status: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        "/parse-date-token": {
            get: {
                summary: string;
                parameters: {
                    in: string;
                    name: string;
                    schema: {
                        type: string;
                    };
                    required: boolean;
                    description: string;
                }[];
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        ParsedToken: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    "400": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        Error: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        "/parse-dynamic-string-token": {
            get: {
                summary: string;
                parameters: {
                    in: string;
                    name: string;
                    schema: {
                        type: string;
                    };
                    required: boolean;
                    description: string;
                }[];
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        ParsedToken: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    "400": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        Error: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export interface CreateServerOptions {
    configOverrides?: Partial<AppConfig>;
    swaggerDefinition?: typeof defaultSwaggerDefinition;
}
export declare const createTokenParserServer: (options?: CreateServerOptions) => {
    app: import("express-serve-static-core").Express;
    logger: import("../services/logger").Logger;
};
export interface StartServerOptions extends CreateServerOptions {
    port?: number;
    onListening?: (server: http.Server) => void;
}
export declare const startTokenParserServer: (options?: StartServerOptions) => Promise<http.Server>;
export {};
//# sourceMappingURL=server.d.ts.map