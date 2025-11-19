import { startTokenParserServer } from "@demo/tokenparser-api-shared";

const resolvePort = () => {
  const raw = process.env.SERVER_PORT ?? process.env.TOKENPARSER_API_PORT ?? process.env.PORT;
  const parsed = raw ? Number(raw) : undefined;
  return Number.isFinite(parsed) ? Number(parsed) : 3000;
};

startTokenParserServer({ port: resolvePort() }).catch((error) => {
  console.error("Failed to start shared token parser API", error);
  process.exit(1);
});
