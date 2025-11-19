import { startTokenParserServer } from "tokenparser-api-shared/api";

const PORT = Number(process.env.PORT ?? 3000);

startTokenParserServer({ port: PORT }).catch((error) => {
  console.error("Failed to start DEMOAPP001 shared Token Parser API", error);
  process.exit(1);
});
