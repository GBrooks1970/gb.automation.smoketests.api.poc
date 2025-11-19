#!/usr/bin/env node
import process from "node:process";
import { startTokenParserServer } from "../server";

const port = Number(process.env.PORT ?? 3000);

startTokenParserServer({ port })
  .then((server) => {
    const handleShutdown = () => {
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
  })
  .catch((error) => {
    console.error("Failed to start shared TokenParser API", error);
    process.exit(1);
  });
