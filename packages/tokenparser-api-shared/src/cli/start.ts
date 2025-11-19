#!/usr/bin/env node
import { startTokenParserServer } from "../server";

type CliOptions = {
  port?: number;
  label?: string;
};

const parseCliArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port") {
      const next = argv[i + 1];
      const parsed = Number(next);
      if (!Number.isNaN(parsed)) {
        options.port = parsed;
      }
      i++;
    } else if (arg === "--label") {
      options.label = argv[i + 1];
      i++;
    }
  }
  return options;
};

const { port, label } = parseCliArgs(process.argv.slice(2));

const loggerCategory =
  label ?? process.env.TOKENPARSER_LOGGER_CATEGORY ?? "TokenParserSharedHost";

startTokenParserServer({
  port: port ?? Number(process.env.PORT ?? 3000),
  loggerCategory,
  onListening: ({ port: listeningPort }) => {
    console.info(`[TokenParserShared] listening on port ${listeningPort} as ${loggerCategory}`);
  },
});
