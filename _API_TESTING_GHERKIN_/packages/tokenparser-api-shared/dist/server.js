"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTokenParserServer = exports.createTokenParserServer = void 0;
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const body_parser_1 = __importDefault(require("body-parser"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const TokenDateParser_1 = require("./tokenparser/TokenDateParser");
const TokenDynamicStringParser_1 = require("./tokenparser/TokenDynamicStringParser");
const date_utils_1 = require("./utils/date-utils");
const config_1 = require("./config");
const logger_1 = require("./services/logger");
const shared_env_1 = require("./config/shared-env");
const createTokenParserServer = (options) => {
    (0, shared_env_1.ensureSharedEnvLoaded)();
    const config = (0, config_1.buildAppConfig)(options?.logLevel ? { logging: { level: options.logLevel } } : undefined);
    const logger = (0, logger_1.createLogger)("TokenParserServer", config.logging.level);
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.json());
    app.use((req, res, next) => {
        const startedAt = Date.now();
        logger.info("request.start", { method: req.method, path: req.path, query: req.query });
        res.on("finish", () => {
            const durationMs = Date.now() - startedAt;
            logger.info("request.finish", {
                method: req.method,
                path: req.path,
                status: res.statusCode,
                durationMs,
            });
        });
        next();
    });
    const CONTRACT_ERROR_MESSAGE = "Invalid string token format";
    const contractErrorMessage = (reason) => {
        if (!reason) {
            return CONTRACT_ERROR_MESSAGE;
        }
        const trimmedReason = reason.trim();
        return trimmedReason.startsWith(CONTRACT_ERROR_MESSAGE)
            ? trimmedReason
            : `${CONTRACT_ERROR_MESSAGE}: ${trimmedReason}`;
    };
    const respondWithContractError = (res, reason) => res.status(400).json({ Error: contractErrorMessage(reason) });
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "Token Parser API",
                version: "1.0.0",
                description: "API to parse token date strings and dynamic string tokens",
            },
            servers: [{ url: "/" }],
        },
        apis: ["./src/server.ts"],
    };
    const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
    app.use("/swagger/v1/json", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    app.get("/swagger/v1/swagger.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    app.get("/swagger/v1/swagger.yaml", (req, res) => {
        const yamlSpec = js_yaml_1.default.dump(swaggerSpec);
        res.setHeader("Content-Type", "application/x-yaml");
        res.send(yamlSpec);
    });
    app.get("/alive", (req, res) => {
        res.status(200).json({ Status: "ALIVE-AND-KICKING" });
    });
    app.get("/parse-date-token", (req, res) => {
        const tokenString = req.query.token ?? "";
        if (!tokenString.trim()) {
            return respondWithContractError(res, "token is required");
        }
        try {
            const parsedDate = TokenDateParser_1.TokenDateParser.parseDateStringToken(tokenString);
            const formattedDate = date_utils_1.DateUtils.formatDateUtc(parsedDate);
            logger.info("parse-date-token.success", { tokenPreview: tokenString.slice(0, 50) });
            return res.status(200).json({ ParsedToken: formattedDate });
        }
        catch (e) {
            const error = e;
            logger.error("parse-date-token.failed", {
                tokenPreview: tokenString.slice(0, 50),
                message: error.message,
                stack: error.stack,
            });
            return respondWithContractError(res, error.message);
        }
    });
    app.get("/parse-dynamic-string-token", (req, res) => {
        const tokenString = req.query.token ?? "";
        if (!tokenString.trim()) {
            return respondWithContractError(res, "token is required");
        }
        try {
            const generatedString = TokenDynamicStringParser_1.TokenDynamicStringParser.parseAndGenerate(tokenString);
            logger.info("parse-dynamic-string-token.success", { tokenPreview: tokenString.slice(0, 50) });
            return res.status(200).json({ ParsedToken: generatedString });
        }
        catch (e) {
            const error = e;
            logger.error("parse-dynamic-string-token.failed", {
                tokenPreview: tokenString.slice(0, 50),
                message: error.message,
                stack: error.stack,
            });
            return respondWithContractError(res, error.message);
        }
    });
    app.get("/health-check", (_req, res) => {
        res.status(200).json({ Status: "Healthy" });
    });
    return { app, logger };
};
exports.createTokenParserServer = createTokenParserServer;
const startTokenParserServer = async (options) => {
    const port = options?.port ?? Number(process.env.TOKENPARSER_PORT ?? process.env.PORT ?? 3000);
    const { app, logger } = (0, exports.createTokenParserServer)(options);
    return await new Promise((resolve) => {
        const server = app.listen(port, () => {
            logger.info(`Token Parser API listening on port ${port}`);
            resolve(server);
        });
    });
};
exports.startTokenParserServer = startTokenParserServer;
