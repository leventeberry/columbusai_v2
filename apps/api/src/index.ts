import express, { type Request, type Response, type NextFunction } from "express";
import { getHealth } from "./routes/health.js";
import { postChat } from "./routes/chat.js";
import { getMessages, postMessages } from "./routes/messages.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

// Default allows browser origins when the app is opened at localhost:3000 (e.g. dev compose).
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
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

app.use(express.json());

app.get("/api/health", getHealth);
app.post("/api/chat", postChat);
app.get("/api/messages", getMessages);
app.post("/api/messages", postMessages);

app.listen(port, () => {
  console.info(`API server listening on port ${port}`);
});
