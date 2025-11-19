import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import YAML from "js-yaml";
import http from "http";
import { TokenDateParser } from "./tokenparser/TokenDateParser";
import { TokenDynamicStringParser } from "./tokenparser/TokenDynamicStringParser";
import { DateUtils } from "./utils/date-utils";
import { createLogger } from "./services/logger";

export interface TokenParserServerOptions {
  swaggerTitle?: string;
}

export interface StartTokenParserServerOptions extends TokenParserServerOptions {
  port?: number;
}

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

export const createTokenParserServer = (
  options?: TokenParserServerOptions,
): express.Express => {
  const logger = createLogger("Server");
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

  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: options?.swaggerTitle ?? "Token Parser API",
        version: "1.0.0",
        description: "API to parse token date strings and dynamic string tokens",
      },
      servers: [{ url: "/" }],
    },
    apis: [__filename],
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
      const parsedValue = TokenDynamicStringParser.parseAndGenerate(tokenString);
      logger.info("parse-dynamic-string-token.success", { tokenPreview: tokenString.slice(0, 50) });
      return res.status(200).json({ ParsedToken: parsedValue });
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

  return app;
};

export const startTokenParserServer = async (
  options?: StartTokenParserServerOptions,
): Promise<http.Server> => {
  const app = createTokenParserServer(options);
  const port = options?.port ?? Number(process.env.TOKENPARSER_API_PORT ?? process.env.PORT ?? 3000);

  return await new Promise((resolve) => {
    const server = app.listen(port, () => {
      const logger = createLogger("Server");
      logger.info("tokenparser.api.listening", { port });
      resolve(server);
    });
  });
};
