import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import bodyParser from "body-parser";
import YAML from "js-yaml";
import http from "http";
import { TokenDateParser } from "../tokenparser/TokenDateParser";
import { TokenDynamicStringParser } from "../tokenparser/TokenDynamicStringParser";
import { DateUtils } from "../utils/date-utils";
import { createLogger } from "../services/logger";
import { AppConfig, getConfig } from "../config";

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

const defaultSwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Token Parser API",
    version: "1.0.0",
    description: "API to parse token date strings and dynamic string tokens",
  },
  servers: [{ url: "/" }],
  paths: {
    "/alive": {
      get: {
        summary: "Check if the API is alive",
        responses: {
          "200": {
            description: "API is alive.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    Status: {
                      type: "string",
                      example: "ALIVE-AND-KICKING",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/parse-date-token": {
      get: {
        summary: "Parse a date token",
        parameters: [
          {
            in: "query",
            name: "token",
            schema: { type: "string" },
            required: true,
            description: "The date token to be parsed",
          },
        ],
        responses: {
          "200": {
            description: "Successfully parsed the date token.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ParsedToken: {
                      type: "string",
                      example: "2023-10-15 12:00:00Z",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid string token format.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    Error: {
                      type: "string",
                      example: CONTRACT_ERROR_MESSAGE,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/parse-dynamic-string-token": {
      get: {
        summary: "Parse a dynamic string token",
        parameters: [
          {
            in: "query",
            name: "token",
            schema: { type: "string" },
            required: true,
            description: "The token to be parsed",
          },
        ],
        responses: {
          "200": {
            description: "Successfully parsed the token.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ParsedToken: {
                      type: "string",
                      example: "generatedstring",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid string token format.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    Error: {
                      type: "string",
                      example: CONTRACT_ERROR_MESSAGE,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export interface CreateServerOptions {
  configOverrides?: Partial<AppConfig>;
  swaggerDefinition?: typeof defaultSwaggerDefinition;
}

export const createTokenParserServer = (options?: CreateServerOptions) => {
  const app = express();
  const config = getConfig(options?.configOverrides);
  const logger = createLogger("TokenParserServer", config.logging.level);

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

  const swaggerSpec = swaggerJsDoc({
    swaggerDefinition: options?.swaggerDefinition ?? defaultSwaggerDefinition,
    apis: [],
  });

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

  return { app, logger };
};

export interface StartServerOptions extends CreateServerOptions {
  port?: number;
  onListening?: (server: http.Server) => void;
}

export const startTokenParserServer = async (
  options?: StartServerOptions,
): Promise<http.Server> => {
  const { app, logger } = createTokenParserServer(options);
  const port = options?.port ?? Number(process.env.PORT ?? 3000);

  return await new Promise<http.Server>((resolve, reject) => {
    const server = app
      .listen(port, () => {
        logger.info(`TOKENPARSER API is running on port ${port}`);
        options?.onListening?.(server);
        resolve(server);
      })
      .on("error", (error) => {
        logger.error("server.failed", { message: error.message, stack: (error as Error).stack });
        reject(error);
      });
  });
};
