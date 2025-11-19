import { startTokenParserServer } from "./server";

const portArgIndex = process.argv.findIndex((arg) => arg.startsWith("--port"));
let cliPort: number | undefined;
if (portArgIndex >= 0) {
  const arg = process.argv[portArgIndex];
  const [, value] = arg.split("=");
  cliPort = Number(value);
}

startTokenParserServer({ port: cliPort })
  .then(() => {
    // keep process alive until interrupted
  })
  .catch((error) => {
    console.error("Failed to start token parser server", error);
    process.exit(1);
  });
