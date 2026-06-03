import express, { type Request, type Response, type NextFunction } from "express";
import { getApiEnv } from "./lib/env.js";
import { getHealth } from "./routes/health.js";
import { postChat } from "./routes/chat.js";
import { getMessages, postMessages } from "./routes/messages.js";
import { postLeadsDemo } from "./routes/leads-demo.js";
import { requireAdminAccess } from "./middleware/requireAdminAccess.js";
import { requireSession } from "./middleware/requireSession.js";
import { requireRole } from "./middleware/requireRole.js";
import { AppUserRole } from "@columbusai/db";
import {
  getLeads,
  getLead,
  patchLeadStatus,
  postConvertLead,
  getPipeline,
  getSalesStats,
} from "./routes/sales/leads.js";
import {
  getOpportunities,
  getOpportunity,
  patchOpportunity,
  postConvertOpportunity,
} from "./routes/sales/opportunities.js";
import { getSalesClients, getSalesClient, getStackTemplates, postRetryProvision } from "./routes/sales/clients.js";
import { postAuthLogin } from "./routes/auth/login.js";
import { postAuthLogout } from "./routes/auth/logout.js";
import { getAuthMe } from "./routes/auth/me.js";
import {
  deleteAdminUser,
  getAdminUsers,
  patchAdminUserRole,
  postAdminUsers,
} from "./routes/admin/users.js";
import { getAdminConversations } from "./routes/admin/conversations.js";
import { getPortalMe } from "./routes/portal/me.js";
import {
  getPortalWorkItem,
  getPortalWorkItems,
  patchPortalWorkItem,
  postPortalWorkComment,
  postPortalWorkItem,
} from "./routes/portal/work-items.js";
import { getPortalNotifications, patchPortalNotificationRead, postPortalNotificationsReadAll } from "./routes/portal/notifications.js";
import { postOnboardingEvent } from "./routes/onboarding/events.js";

const env = getApiEnv();
const app = express();
const { port, corsOrigins } = env;

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Widget-Origin, X-Admin-Token, Authorization, Cookie",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: "1mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  (req as Request & { id?: string }).id = crypto.randomUUID();
  next();
});

const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>,
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

const asyncMiddleware =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const adminAccess = asyncMiddleware(requireAdminAccess);
const sessionRequired = asyncMiddleware(requireSession);
const adminRoleRequired = [
  sessionRequired,
  (req: Request, res: Response, next: NextFunction) => {
    requireRole(AppUserRole.SUPER_ADMIN, AppUserRole.ADMIN)(req, res, next);
  },
];

app.get("/api/health", getHealth);
app.post("/api/chat", asyncHandler(postChat));
app.get("/api/messages", asyncHandler(getMessages));
app.post("/api/messages", asyncHandler(postMessages));
app.post("/api/leads/demo", asyncHandler(postLeadsDemo));

app.post("/api/auth/login", asyncHandler(postAuthLogin));
app.post("/api/auth/logout", asyncHandler(postAuthLogout));
app.get("/api/auth/me", sessionRequired, asyncHandler(getAuthMe));

app.get("/api/admin/users", ...adminRoleRequired, asyncHandler(getAdminUsers));
app.post("/api/admin/users", ...adminRoleRequired, asyncHandler(postAdminUsers));
app.patch("/api/admin/users/:id/role", ...adminRoleRequired, asyncHandler(patchAdminUserRole));
app.delete("/api/admin/users/:id", ...adminRoleRequired, asyncHandler(deleteAdminUser));
app.get("/api/admin/conversations", adminAccess, asyncHandler(getAdminConversations));

app.get("/api/portal/me", sessionRequired, asyncHandler(getPortalMe));
app.get("/api/portal/notifications", sessionRequired, asyncHandler(getPortalNotifications));
app.patch("/api/portal/notifications/:id/read", sessionRequired, asyncHandler(patchPortalNotificationRead));
app.post("/api/portal/notifications/read-all", sessionRequired, asyncHandler(postPortalNotificationsReadAll));
app.get("/api/portal/work-items", sessionRequired, asyncHandler(getPortalWorkItems));
app.get("/api/portal/work-items/:id", sessionRequired, asyncHandler(getPortalWorkItem));
app.post("/api/portal/work-items", sessionRequired, asyncHandler(postPortalWorkItem));
app.patch("/api/portal/work-items/:id", sessionRequired, asyncHandler(patchPortalWorkItem));
app.post(
  "/api/portal/work-items/:id/comments",
  sessionRequired,
  asyncHandler(postPortalWorkComment),
);

app.get("/api/leads", adminAccess, asyncHandler(getLeads));
app.get("/api/leads/pipeline", adminAccess, asyncHandler(getPipeline));
app.get("/api/sales/stats", adminAccess, asyncHandler(getSalesStats));
app.get("/api/leads/:id", adminAccess, asyncHandler(getLead));
app.patch("/api/leads/:id/status", adminAccess, asyncHandler(patchLeadStatus));
app.post("/api/leads/:id/convert-to-opportunity", adminAccess, asyncHandler(postConvertLead));
app.get("/api/opportunities", adminAccess, asyncHandler(getOpportunities));
app.get("/api/opportunities/:id", adminAccess, asyncHandler(getOpportunity));
app.patch("/api/opportunities/:id", adminAccess, asyncHandler(patchOpportunity));
app.post("/api/opportunities/:id/convert-to-client", adminAccess, asyncHandler(postConvertOpportunity));
app.get("/api/clients", adminAccess, asyncHandler(getSalesClients));
app.get("/api/clients/:id", adminAccess, asyncHandler(getSalesClient));
app.post("/api/clients/:id/retry-provision", adminAccess, asyncHandler(postRetryProvision));
app.get("/api/onboarding/stack-templates", adminAccess, asyncHandler(getStackTemplates));
app.post("/api/onboarding/events", adminAccess, asyncHandler(postOnboardingEvent));

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
    }),
  );
  if (res.headersSent) return;
  const isProd = process.env.NODE_ENV === "production";
  res.status(500).json({
    error: "Internal server error",
    ...(!isProd && err instanceof Error && { debug: err.message }),
  });
});

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
