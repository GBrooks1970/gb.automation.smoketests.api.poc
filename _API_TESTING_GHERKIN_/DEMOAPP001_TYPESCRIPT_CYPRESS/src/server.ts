import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import bodyParser from "body-parser";
import { TokenDateParser } from "./tokenparser/TokenDateParser";
import { TokenDynamicStringParser } from "./tokenparser/TokenDynamicStringParser";
import YAML from "js-yaml";
import { getConfig } from "./config";
import { createLogger } from "./services/logger";
import { DateUtils } from "./utils/date-utils";

const app = express();
app.use(bodyParser.json());
const config = getConfig();
const logger = createLogger("Server");

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

// Initialize swagger-jsdoc -> returns the Swagger specification in JSON
const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Serve Swagger UI for the JSON endpoint
app.use("/swagger/v1/json", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve the raw OpenAPI JSON
app.get("/swagger/v1/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Serve the raw OpenAPI YAML
app.get("/swagger/v1/swagger.yaml", (req, res) => {
  const yamlSpec = YAML.dump(swaggerSpec);
  res.setHeader("Content-Type", "application/x-yaml");
  res.send(yamlSpec);
});

/**
 * @swagger
 * /alive:
 *   get:
 *     summary: Check if the API is alive
 *     description: Returns the status of the API.
 *     responses:
 *       200:
 *         description: API is alive.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Status:
 *                   type: string
 *                   example: ALIVE-AND-KICKING
 */
app.get("/alive", (req, res) => {
  res.status(200).json({ Status: "ALIVE-AND-KICKING" });
});

/**
 * @swagger
 * /parse-date-token:
 *   get:
 *     summary: Parse a date token
 *     description: Parses the provided token into a formatted date string.
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: The date token to be parsed
 *     responses:
 *       200:
 *         description: Successfully parsed the date token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ParsedToken:
 *                   type: string
 *                   example: 2023-10-15 12:00:00Z
 *       400:
 *         description: Invalid string token format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Error:
 *                   type: string
 *                   example: Invalid string token format
 */
app.get("/parse-date-token", (req: Request, res: Response) => {
  const tokenString = (req.query.token as string) ?? "";
  if (!tokenString.trim()) {
    return respondWithContractError(res, "token is required");
  }

  try {
    const parsedDate = TokenDateParser.parseDateStringToken(tokenString); // Use the TokenDateParser class
    // Always format in UTC regardless of host timezone
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

/**
 * @swagger
 * /parse-dynamic-string-token:
 *   get:
 *     summary: Parse a dynamic string token
 *     description: Parses the provided token into a dynamic string.
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: The token to be parsed
 *     responses:
 *       200:
 *         description: Successfully parsed the token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ParsedToken:
 *                   type: string
 *                   example: generatedstring
 *       400:
 *         description: Invalid string token format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Error:
 *                   type: string
 *                   example: Invalid string token format
 */
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`TOKENPARSER API is running on port ${PORT}`, `(log level: ${config.logging.level})`);
});
