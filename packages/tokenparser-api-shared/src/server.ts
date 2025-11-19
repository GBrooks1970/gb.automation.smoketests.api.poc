import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import YAML from "js-yaml";
import { Server } from "http";

import { getConfig } from "./config";
import { createLogger, Logger } from "./services/logger";
import { DateUtils } from "./utils/date-utils";
import { TokenDateParser } from "./tokenparser/TokenDateParser";
import { TokenDynamicStringParser } from "./tokenparser/TokenDynamicStringParser";

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

type SwaggerSpec = ReturnType<typeof swaggerJsDoc>;

const buildSwagger = (): SwaggerSpec => swaggerJsDoc(swaggerOptions);

const attachSwaggerRoutes = (app: express.Express, spec: SwaggerSpec) => {
  app.use("/swagger/v1/json", swaggerUi.serve, swaggerUi.setup(spec));

  app.get("/swagger/v1/swagger.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(spec);
  });

  app.get("/swagger/v1/swagger.yaml", (_req: Request, res: Response) => {
    const yamlSpec = YAML.dump(spec);
    res.setHeader("Content-Type", "application/x-yaml");
    res.send(yamlSpec);
  });
};

const registerRoutes = (app: express.Express, logger: Logger) => {
  app.get("/alive", (_req, res) => {
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
    } catch (error) {
      const err = error as Error;
      logger.error("parse-date-token.failed", {
        tokenPreview: tokenString.slice(0, 50),
        message: err.message,
        stack: err.stack,
      });
      return respondWithContractError(res, err.message);
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
    } catch (error) {
      const err = error as Error;
      logger.error("parse-dynamic-string-token.failed", {
        tokenPreview: tokenString.slice(0, 50),
        message: err.message,
        stack: err.stack,
      });
      return respondWithContractError(res, err.message);
    }
  });
};

export interface CreateTokenParserAppResult {
  app: express.Express;
  config: ReturnType<typeof getConfig>;
  logger: Logger;
}

export interface CreateTokenParserAppOptions {
  loggerCategory?: string;
}

export const createTokenParserApp = (
  options?: CreateTokenParserAppOptions,
): CreateTokenParserAppResult => {
  const app = express();
  const config = getConfig();
  const logger = createLogger(options?.loggerCategory ?? "Server");

  app.use(bodyParser.json());
  app.use((req: Request, res: Response, next: express.NextFunction) => {
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

  const swaggerSpec = buildSwagger();
  attachSwaggerRoutes(app, swaggerSpec);
  registerRoutes(app, logger);

  return { app, config, logger };
};

export interface StartTokenParserServerOptions {
  port?: number;
  loggerCategory?: string;
  onListening?: (info: { port: number }) => void;
}

export const startTokenParserServer = (options?: StartTokenParserServerOptions): Server => {
  const { app, config, logger } = createTokenParserApp({
    loggerCategory: options?.loggerCategory,
  });
  const port = options?.port ?? Number(process.env.PORT ?? 3000);

  const server = app.listen(port, () => {
    logger.info(`TOKENPARSER API is running on port ${port}`, `(log level: ${config.logging.level})`);
    options?.onListening?.({ port });
  });

  return server;
};
