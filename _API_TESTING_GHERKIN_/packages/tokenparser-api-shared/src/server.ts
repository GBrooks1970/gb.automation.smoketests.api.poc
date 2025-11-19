import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import bodyParser from "body-parser";
import YAML from "js-yaml";
import http from "http";
import { TokenDateParser } from "./tokenparser/TokenDateParser";
import { TokenDynamicStringParser } from "./tokenparser/TokenDynamicStringParser";
import { DateUtils } from "./utils/date-utils";
import { buildAppConfig, LogLevel } from "./config";
import { createLogger } from "./services/logger";
import { ensureSharedEnvLoaded } from "./config/shared-env";

export interface CreateTokenParserServerOptions {
  logLevel?: LogLevel;
}

export interface StartTokenParserServerOptions extends CreateTokenParserServerOptions {
  port?: number;
}

export const createTokenParserServer = (options?: CreateTokenParserServerOptions) => {
  ensureSharedEnvLoaded();
  const config = buildAppConfig(
    options?.logLevel ? { logging: { level: options.logLevel } } : undefined,
  );
  const logger = createLogger("TokenParserServer", config.logging.level);
  const app = express();
  app.use(bodyParser.json());

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

  const contractErrorMessage = (reason?: string): string => {
    if (!reason) {
      return CONTRACT_ERROR_MESSAGE;
    }
    const trimmedReason = reason.trim();
    return trimmedReason.startsWith(CONTRACT_ERROR_MESSAGE)
      ? trimmedReason
      : `${CONTRACT_ERROR_MESSAGE}: ${trimmedReason}`;
  };

  const respondWithContractError = (res: Response, reason?: string) =>
    res.status(400).json({ Error: contractErrorMessage(reason) });

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

  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  app.use("/swagger/v1/json", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/swagger/v1/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.get("/swagger/v1/swagger.yaml", (req, res) => {
    const yamlSpec = YAML.dump(swaggerSpec);
    res.setHeader("Content-Type", "application/x-yaml");
    res.send(yamlSpec);
  });

  app.get("/alive", (req, res) => {
    res.status(200).json({ Status: "ALIVE-AND-KICKING" });
  });

  app.get("/parse-date-token", (req: Request, res: Response) => {
    const tokenString = (req.query.token as string) ?? "";
    if (!tokenString.trim()) {
      return respondWithContractError(res, "token is required");
    }

    try {
      const parsedDate = TokenDateParser.parseDateStringToken(tokenString);
      const formattedDate = DateUtils.formatDateUtc(parsedDate);
      logger.info("parse-date-token.success", { tokenPreview: tokenString.slice(0, 50) });
      return res.status(200).json({ ParsedToken: formattedDate });
    } catch (e) {
      const error = e as Error;
      logger.error("parse-date-token.failed", {
        tokenPreview: tokenString.slice(0, 50),
        message: error.message,
        stack: error.stack,
      });
      return respondWithContractError(res, error.message);
    }
  });

  app.get("/parse-dynamic-string-token", (req: Request, res: Response) => {
    const tokenString = (req.query.token as string) ?? "";
    if (!tokenString.trim()) {
      return respondWithContractError(res, "token is required");
    }

    try {
      const generatedString = TokenDynamicStringParser.parseAndGenerate(tokenString);
      logger.info("parse-dynamic-string-token.success", { tokenPreview: tokenString.slice(0, 50) });
      return res.status(200).json({ ParsedToken: generatedString });
    } catch (e) {
      const error = e as Error;
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

export const startTokenParserServer = async (
  options?: StartTokenParserServerOptions,
): Promise<http.Server> => {
  const port = options?.port ?? Number(process.env.TOKENPARSER_PORT ?? process.env.PORT ?? 3000);
  const { app, logger } = createTokenParserServer(options);

  return await new Promise((resolve) => {
    const server = app.listen(port, () => {
      logger.info(`Token Parser API listening on port ${port}`);
      resolve(server);
    });
  });
};
