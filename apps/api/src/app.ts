import express, { type Request, type Response, type NextFunction } from "express";
import { getApiEnv } from "./lib/env.js";
import { getHealth } from "./routes/health.js";
import { postChat } from "./routes/chat.js";
import { getMessages, postMessages } from "./routes/messages.js";
import { postLeadsDemo } from "./routes/leads-demo.js";
import {
  requireAdminReadAccess,
  requireAdminWriteAccess,
} from "./middleware/requireAdminAccess.js";
import { requireSession } from "./middleware/requireSession.js";
import { requireRole } from "./middleware/requireRole.js";
import { AppUserRole } from "@columbusai/db";
import {
  getLeads,
  getLead,
  postCreateLead,
  patchLeadStatus,
  patchLeadNotes,
  getLeadActivity,
  getRecentActivity,
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
import {
  getSalesClients,
  getSalesClient,
  getStackTemplates,
  postRetryProvision,
} from "./routes/sales/clients.js";
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
import {
  getPortalNotifications,
  patchPortalNotificationRead,
  postPortalNotificationsReadAll,
} from "./routes/portal/notifications.js";
import { postOnboardingEvent } from "./routes/onboarding/events.js";

export function createApp(): express.Application {
  const env = getApiEnv();
  const app = express();
  const { corsOrigins } = env;

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && corsOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-Widget-Origin, X-Admin-Token, X-Conversation-Token, Authorization, Cookie",
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

  const adminRead = asyncMiddleware(requireAdminReadAccess);
  const adminWrite = asyncMiddleware(requireAdminWriteAccess);
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
  app.patch(
    "/api/admin/users/:id/role",
    ...adminRoleRequired,
    asyncHandler(patchAdminUserRole),
  );
  app.delete("/api/admin/users/:id", ...adminRoleRequired, asyncHandler(deleteAdminUser));
  app.get("/api/admin/conversations", adminRead, asyncHandler(getAdminConversations));

  app.get("/api/portal/me", sessionRequired, asyncHandler(getPortalMe));
  app.get("/api/portal/notifications", sessionRequired, asyncHandler(getPortalNotifications));
  app.patch(
    "/api/portal/notifications/:id/read",
    sessionRequired,
    asyncHandler(patchPortalNotificationRead),
  );
  app.post(
    "/api/portal/notifications/read-all",
    sessionRequired,
    asyncHandler(postPortalNotificationsReadAll),
  );
  app.get("/api/portal/work-items", sessionRequired, asyncHandler(getPortalWorkItems));
  app.get("/api/portal/work-items/:id", sessionRequired, asyncHandler(getPortalWorkItem));
  app.post("/api/portal/work-items", sessionRequired, asyncHandler(postPortalWorkItem));
  app.patch("/api/portal/work-items/:id", sessionRequired, asyncHandler(patchPortalWorkItem));
  app.post(
    "/api/portal/work-items/:id/comments",
    sessionRequired,
    asyncHandler(postPortalWorkComment),
  );

  app.get("/api/leads", adminRead, asyncHandler(getLeads));
  app.post("/api/leads", adminWrite, asyncHandler(postCreateLead));
  app.get("/api/leads/pipeline", adminRead, asyncHandler(getPipeline));
  app.get("/api/sales/stats", adminRead, asyncHandler(getSalesStats));
  app.get("/api/activity/recent", adminRead, asyncHandler(getRecentActivity));
  app.get("/api/leads/:id", adminRead, asyncHandler(getLead));
  app.patch("/api/leads/:id/status", adminWrite, asyncHandler(patchLeadStatus));
  app.patch("/api/leads/:id/notes", adminWrite, asyncHandler(patchLeadNotes));
  app.get("/api/leads/:id/activity", adminRead, asyncHandler(getLeadActivity));
  app.post("/api/leads/:id/convert-to-opportunity", adminWrite, asyncHandler(postConvertLead));
  app.get("/api/opportunities", adminRead, asyncHandler(getOpportunities));
  app.get("/api/opportunities/:id", adminRead, asyncHandler(getOpportunity));
  app.patch("/api/opportunities/:id", adminWrite, asyncHandler(patchOpportunity));
  app.post(
    "/api/opportunities/:id/convert-to-client",
    adminWrite,
    asyncHandler(postConvertOpportunity),
  );
  app.get("/api/clients", adminRead, asyncHandler(getSalesClients));
  app.get("/api/clients/:id", adminRead, asyncHandler(getSalesClient));
  app.post("/api/clients/:id/retry-provision", adminWrite, asyncHandler(postRetryProvision));
  app.get("/api/onboarding/stack-templates", adminRead, asyncHandler(getStackTemplates));
  app.post("/api/onboarding/events", adminWrite, asyncHandler(postOnboardingEvent));

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

  return app;
}
