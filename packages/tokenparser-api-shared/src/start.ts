import process from "process";
import { startTokenParserServer } from "./api/server";

const parseArg = (name: string): string | undefined => {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
};

const port = Number(parseArg("port") ?? process.env.PORT ?? 3000);

startTokenParserServer({ port })
  .then(() => {
    // Keep process alive until interrupted
  })
  .catch((error) => {
    console.error("Failed to start shared Token Parser API", error);
    process.exit(1);
  });
