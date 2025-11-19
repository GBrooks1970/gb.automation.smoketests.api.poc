import { startTokenParserServer } from "tokenparser-api-shared";

const PORT = Number(process.env.PORT ?? 3000);

startTokenParserServer({ port: PORT, loggerCategory: "DEMOAPP001" });
