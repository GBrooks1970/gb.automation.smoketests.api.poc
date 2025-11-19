import { startTokenParserServer } from "tokenparser-api-shared/api";

const PORT = Number(process.env.PORT ?? 3001);

startTokenParserServer({ port: PORT }).catch((error) => {
  console.error("Failed to start DEMOAPP003 shared Token Parser API", error);
  process.exit(1);
});
