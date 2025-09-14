import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import bodyParser from 'body-parser';
import { format } from 'date-fns';
import { TokenDateParser } from './tokenparser/TokenDateParser';
import { TokenDynamicStringParser } from './tokenparser/TokenDynamicStringParser';
import YAML from "js-yaml";

const app = express();
app.use(bodyParser.json());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Token Parser API',
            version: '1.0.0',
            description: 'API to parse token date strings and dynamic string tokens',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['./src/server.ts'],
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
app.get('/alive', (req, res) => {
    res.status(200).json({ Status: 'ALIVE-AND-KICKING' });
  });

/**
 * @swagger
 * /Parse-date-token:
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
 *         description: Invalid string token format .
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Error:
 *                   type: string
 *                   example: Invalid string token format 
 */
app.get('/parse-date-token', (req: Request, res: Response) => {
    const tokenString = req.query.token as string;
    if (!tokenString) {
        return res.status(400).json({ Error: 'Token date is required' });
    }

    try {
        const parsedDate = TokenDateParser.parseDateStringToken(tokenString); // Use the TokenDateParser class
        // Generate the current date and format it to the desired format
        const formattedDate = format(parsedDate, "yyyy-MM-dd HH:mm:ssX");
        return res.status(200).json({ ParsedToken: formattedDate });
    } catch (e) {
        return res.status(400).json({ Error: (e as Error).message });
    }
});

/**
 * @swagger
 * /Parse-dynamic-string-token:
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
 *         description: Invalid string token format .
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Error:
 *                   type: string
 *                   example: Invalid string token format 
 */
app.get('/parse-dynamic-string-token', (req: Request, res: Response) => {
    const tokenString = req.query.token as string;
    if (!tokenString) {
      return res.status(400).json({ Error: 'Token string is required' });
    }
  
    try {
      const generatedString = TokenDynamicStringParser.parseAndGenerate(tokenString);
      return res.status(200).json({ ParsedToken: generatedString });
    } catch (e) {
        return res.status(400).json({ Error: (e as Error).message });
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`TOKENPARSER API is running on port ${PORT}`);
});
