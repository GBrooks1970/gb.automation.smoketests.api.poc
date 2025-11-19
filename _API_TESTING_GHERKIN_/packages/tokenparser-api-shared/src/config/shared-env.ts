import fs from "fs";
import path from "path";
import { config as loadEnvFile } from "dotenv";

let sharedEnvLoaded = false;

const resolveSharedEnvPath = (): string | undefined => {
  const candidates = [
    path.resolve(__dirname, "..", ".env.demoapp_ts_api"),
    path.resolve(__dirname, "..", "..", ".env.demoapp_ts_api"),
    path.resolve(__dirname, "..", "..", "..", ".env.demoapp_ts_api"),
    path.resolve(process.cwd(), ".env.demoapp_ts_api"),
    path.resolve(process.cwd(), "..", ".env.demoapp_ts_api"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
};

export const ensureSharedEnvLoaded = (): void => {
  if (sharedEnvLoaded) {
    return;
  }

  const envPath = resolveSharedEnvPath();
  if (envPath) {
    loadEnvFile({ path: envPath });
  }

  sharedEnvLoaded = true;
};
