import { getApiEnv } from "./lib/env.js";
import { createApp } from "./app.js";

const env = getApiEnv();
const { port } = env;
const app = createApp();

const isProd = process.env.NODE_ENV === "production";
process.on("unhandledRejection", (reason) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: "unhandledRejection",
      reason: reason instanceof Error ? reason.message : String(reason),
    }),
  );
  if (isProd) process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: "uncaughtException",
      error: err instanceof Error ? err.message : String(err),
    }),
  );
  if (isProd) process.exit(1);
});

app.listen(port, () => {
  console.info(`API server listening on port ${port}`);
});
