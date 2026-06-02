import express, { type Request, type Response, type NextFunction } from "express";
import { getApiEnv } from "./lib/env.js";
import { getHealth } from "./routes/health.js";
import { postChat } from "./routes/chat.js";
import { getMessages, postMessages } from "./routes/messages.js";
import { postLeadsDemo } from "./routes/leads-demo.js";

const env = getApiEnv();
const app = express();
const { port, corsOrigins } = env;

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Widget-Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: "1mb" }));

// Request id for error logging (Audit 2.1).
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as Request & { id?: string }).id = crypto.randomUUID();
  next();
});

// Wrap async route handlers so rejections are passed to error middleware (Express 4).
const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

app.get("/api/health", getHealth);
app.post("/api/chat", asyncHandler(postChat));
app.get("/api/messages", asyncHandler(getMessages));
app.post("/api/messages", asyncHandler(postMessages));
app.post("/api/leads/demo", asyncHandler(postLeadsDemo));

// Global error middleware (Audit 2.1): log and return 500 so clients don't hang.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const reqId = (req as Request & { id?: string }).id;
  console.error(
    JSON.stringify({
      level: "error",
      message: "Unhandled error",
      method: req.method,
      path: req.path,
      ...(reqId && { request_id: reqId }),
      error: err instanceof Error ? err.message : String(err),
    })
  );
  if (res.headersSent) return;
  const isProd = process.env.NODE_ENV === "production";
  res
    .status(500)
    .json({
      error: "Internal server error",
      ...(!isProd &&
        err instanceof Error && { debug: err.message }),
    });
});

const isProd = process.env.NODE_ENV === "production";
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: "unhandledRejection",
      reason: reason instanceof Error ? reason.message : String(reason),
    })
  );
  if (isProd) process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: "uncaughtException",
      error: err instanceof Error ? err.message : String(err),
    })
  );
  if (isProd) process.exit(1);
});

app.listen(port, () => {
  console.info(`API server listening on port ${port}`);
});
