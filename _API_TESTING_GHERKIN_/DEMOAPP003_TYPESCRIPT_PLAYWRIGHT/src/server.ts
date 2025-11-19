import { startTokenParserServer } from "tokenparser-api-shared";

const PORT = Number(process.env.PORT ?? 3001);

startTokenParserServer({ port: PORT, loggerCategory: "DEMOAPP003" });
