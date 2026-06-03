import fs from "node:fs";
import path from "node:path";
import { FOLLOWUP_TEMPLATE_WORKFLOW_NAMES } from "./lib/followup-templates.js";
import { FOLLOWUP_EMAIL_COPY } from "../../packages/leads/src/followup/emailCopy.js";
import {
  FOLLOWUP_TEMPLATES,
  type FollowupObjective,
  type FollowupTemplate,
  type FollowupTemplateId,
} from "../../packages/leads/src/followup/templates.js";

const REPO_ROOT = path.join(import.meta.dirname, "../..");
const OBJECTIVES_DIR = path.join(REPO_ROOT, "infra/n8n/email/objectives");
const OUTPUT_DIR = path.join(REPO_ROOT, "infra/n8n/workflows/templates");

function readObjectiveBody(objective: FollowupObjective): string {
  const filePath = path.join(OBJECTIVES_DIR, `${objective}.html`);
  return fs.readFileSync(filePath, "utf8").trim();
}

function wrapEmailHtml(headline: string, body: string): string {
  const cta = `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:6px; background-color:#2c3e50;">
                    <a href="{{ $('Normalize Lead').item.json.booking_link }}" style="display:inline-block; padding:12px 24px; color:#ffffff; text-decoration:none; font-weight:bold;">Schedule a discovery call</a>
                  </td>
                </tr>
              </table>`;

  const closing =
    objectiveUsesSoftClose(headline)
      ? `<p>Warm regards,<br><strong>Columbus AI Automation Solutions, LLC</strong><br>Columbus, Ohio</p>`
      : `<p>We look forward to connecting with you.</p>
              <p>Thank you,<br><strong>Columbus AI Automation Solutions, LLC</strong><br>Columbus, Ohio</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${headline} – Columbus AI</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background-color:#ffffff;">
          <tr>
            <td style="background-color:#2c3e50; color:#ffffff; padding:20px 32px;">
              <h1 style="margin:0; font-size:20px; font-weight:bold;">${headline}</h1>
              <p style="margin:4px 0 0; font-size:12px; opacity:0.9;">Columbus AI Automation Solutions, LLC</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px; color:#333333; font-size:16px; line-height:1.6;">
              ${body}
              ${cta}
              ${closing}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function objectiveUsesSoftClose(headline: string): boolean {
  return headline.toLowerCase().includes("close the loop");
}

function buildSelectQuery(template: FollowupTemplate): string {
  const touchCount = template.touches.length;
  return `SELECT
  l.id,
  l.created_at,
  l.updated_at,
  l.fname,
  l.lname,
  l.email,
  l.phone,
  l.company,
  l.role,
  l.industry,
  l.team_size,
  l.what_automate,
  l.budget,
  l.timeline,
  l.website,
  l.status,
  l.source,
  l.notes,
  l.summary,
  l.priority,
  l.confidence,
  l.recommended_next_step,
  l.followup_count,
  l.followup_template
FROM sales.leads l
WHERE l.status = 'new'
  AND l.source = 'demo_request'
  AND l.followup_template = '${template.id}'
  AND l.followup_count < ${touchCount}
  AND l.next_followup_at IS NOT NULL
  AND l.next_followup_at <= NOW()
ORDER BY l.next_followup_at ASC
LIMIT 50;`;
}

function buildUpdateQuery(template: FollowupTemplate): string {
  const cases = template.touches
    .slice(0, -1)
    .map((touch, index) => {
      const nextDay = template.touches[index + 1]!.day;
      return `    WHEN followup_count = ${index} THEN created_at + INTERVAL '${nextDay} days'`;
    })
    .join("\n");

  return `UPDATE sales.leads
SET
  followup_count = followup_count + 1,
  last_followup_at = NOW(),
  next_followup_at = CASE
${cases}
    ELSE NULL
  END,
  updated_at = NOW()
WHERE id = '{{ $('Normalize Lead').item.json.id }}'::uuid
  AND status = 'new'
  AND followup_template = '${template.id}'
  AND followup_count = {{ $('Normalize Lead').item.json.followup_count }};`;
}

function buildNormalizeAssignments() {
  return [
    { id: "nl-id", name: "id", value: "={{ $json.id }}", type: "string" },
    { id: "nl-created", name: "created_at", value: "={{ $json.created_at }}", type: "string" },
    { id: "nl-updated", name: "updated_at", value: "={{ $json.updated_at }}", type: "string" },
    { id: "nl-fname", name: "fname", value: "={{ $json.fname }}", type: "string" },
    { id: "nl-lname", name: "lname", value: "={{ $json.lname }}", type: "string" },
    { id: "nl-email", name: "email", value: "={{ $json.email }}", type: "string" },
    { id: "nl-phone", name: "phone", value: "={{ $json.phone || '' }}", type: "string" },
    { id: "nl-company", name: "company", value: "={{ $json.company || '' }}", type: "string" },
    { id: "nl-role", name: "role", value: "={{ $json.role || '' }}", type: "string" },
    { id: "nl-industry", name: "industry", value: "={{ $json.industry || '' }}", type: "string" },
    { id: "nl-team", name: "team_size", value: "={{ $json.team_size || '' }}", type: "string" },
    { id: "nl-what", name: "what_automate", value: "={{ $json.what_automate }}", type: "string" },
    { id: "nl-budget", name: "budget", value: "={{ $json.budget || '' }}", type: "string" },
    { id: "nl-timeline", name: "timeline", value: "={{ $json.timeline || '' }}", type: "string" },
    { id: "nl-website", name: "website", value: "={{ $json.website || '' }}", type: "string" },
    { id: "nl-status", name: "status", value: "={{ $json.status }}", type: "string" },
    { id: "nl-source", name: "source", value: "={{ $json.source }}", type: "string" },
    { id: "nl-notes", name: "notes", value: "={{ $json.notes || '' }}", type: "string" },
    { id: "nl-summary", name: "summary", value: "={{ $json.summary || '' }}", type: "string" },
    { id: "nl-priority", name: "priority", value: "={{ $json.priority || '' }}", type: "string" },
    { id: "nl-confidence", name: "confidence", value: "={{ $json.confidence }}", type: "number" },
    {
      id: "nl-next",
      name: "recommended_next_step",
      value: "={{ $json.recommended_next_step || '' }}",
      type: "string",
    },
    { id: "nl-count", name: "followup_count", value: "={{ $json.followup_count }}", type: "number" },
    {
      id: "nl-template",
      name: "followup_template",
      value: "={{ $json.followup_template }}",
      type: "string",
    },
    {
      id: "nl-contact",
      name: "contact_name",
      value: "={{ ($json.fname || '') + ' ' + ($json.lname || '') }}",
      type: "string",
    },
    {
      id: "nl-booking",
      name: "booking_link",
      value: "={{ $env.BOOKING_LINK || 'https://cal.com/columbus-ai/30min' }}",
      type: "string",
    },
  ];
}

function buildWorkflow(template: FollowupTemplate): Record<string, unknown> {
  const prefix = template.id === "2day" ? "ft2" : template.id === "7day" ? "ft7" : "ft14";
  const touchCount = template.touches.length;
  const nodes: Record<string, unknown>[] = [];
  const connections: Record<string, { main: unknown[][] }> = {};

  nodes.push({
    parameters: {
      rule: { interval: [{ field: "minutes", minutesInterval: 15 }] },
    },
    type: "n8n-nodes-base.scheduleTrigger",
    typeVersion: 1.3,
    position: [-1200, 320],
    id: `${prefix}-schedule`,
    name: "Schedule Trigger",
  });

  nodes.push({
    parameters: { operation: "executeQuery", query: buildSelectQuery(template), options: {} },
    type: "n8n-nodes-base.postgres",
    typeVersion: 2.6,
    position: [-960, 320],
    id: `${prefix}-select`,
    name: "Select Due Leads",
    credentials: { postgres: { name: "Postgres account" } },
  });

  nodes.push({
    parameters: { options: {} },
    type: "n8n-nodes-base.splitInBatches",
    typeVersion: 3,
    position: [-720, 320],
    id: `${prefix}-loop`,
    name: "Loop Over Items",
  });

  nodes.push({
    parameters: { assignments: { assignments: buildNormalizeAssignments() }, options: {} },
    type: "n8n-nodes-base.set",
    typeVersion: 3.4,
    position: [-480, 480],
    id: `${prefix}-normalize`,
    name: "Normalize Lead",
  });

  const switchRules = template.touches.map((_, index) => ({
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "strict",
        version: 3,
      },
      conditions: [
        {
          leftValue: "={{ $json.followup_count }}",
          rightValue: index,
          operator: { type: "number", operation: "equals" },
        },
      ],
      combinator: "and",
    },
  }));

  nodes.push({
    parameters: { rules: { values: switchRules }, options: {} },
    type: "n8n-nodes-base.switch",
    typeVersion: 3.4,
    position: [-240, 480],
    id: `${prefix}-switch`,
    name: "Switch",
  });

  const switchOutputs: { node: string; type: string; index: number }[][] = [];

  template.touches.forEach((touch, index) => {
    const copy = FOLLOWUP_EMAIL_COPY[touch.objective];
    const body = readObjectiveBody(touch.objective);
    const html = wrapEmailHtml(copy.headline, body);
    const y = 200 + index * 160;
    const htmlNodeName = `Email ${index + 1} HTML`;
    const sendNodeName = `Email ${index + 1} Send`;

    nodes.push({
      parameters: { html },
      type: "n8n-nodes-base.html",
      typeVersion: 1.2,
      position: [0, y],
      id: `${prefix}-html-${index}`,
      name: htmlNodeName,
    });

    nodes.push({
      parameters: {
        fromEmail: "no-reply@columbusai.tech",
        toEmail: "={{ $('Normalize Lead').item.json.email }}",
        subject: copy.subject,
        html: "={{ $json.html }}",
        options: { appendAttribution: false },
      },
      type: "n8n-nodes-base.emailSend",
      typeVersion: 2.1,
      position: [240, y],
      id: `${prefix}-send-${index}`,
      name: sendNodeName,
      credentials: { smtp: { name: "SMTP account" } },
    });

    switchOutputs.push([{ node: htmlNodeName, type: "main", index: 0 }]);
    connections[htmlNodeName] = {
      main: [[{ node: sendNodeName, type: "main", index: 0 }]],
    };
    connections[sendNodeName] = {
      main: [[{ node: "Mark Follow-Up Sent", type: "main", index: 0 }]],
    };
  });

  nodes.push({
    parameters: {
      operation: "executeQuery",
      query: `=${buildUpdateQuery(template)}`,
      options: {},
    },
    type: "n8n-nodes-base.postgres",
    typeVersion: 2.6,
    position: [480, 480],
    id: `${prefix}-update`,
    name: "Mark Follow-Up Sent",
    credentials: { postgres: { name: "Postgres account" } },
  });

  connections["Schedule Trigger"] = {
    main: [[{ node: "Select Due Leads", type: "main", index: 0 }]],
  };
  connections["Select Due Leads"] = {
    main: [[{ node: "Loop Over Items", type: "main", index: 0 }]],
  };
  connections["Loop Over Items"] = {
    main: [[], [{ node: "Normalize Lead", type: "main", index: 0 }]],
  };
  connections["Normalize Lead"] = {
    main: [[{ node: "Switch", type: "main", index: 0 }]],
  };
  connections["Switch"] = { main: switchOutputs };
  connections["Mark Follow-Up Sent"] = {
    main: [[{ node: "Loop Over Items", type: "main", index: 0 }]],
  };

  const dayList = template.touches.map((t) => t.day).join(", ");

  return {
    name: FOLLOWUP_TEMPLATE_WORKFLOW_NAMES[template.id],
    description: `TEMPLATE ONLY — import and activate one follow-up template per deployment. ${template.label}: emails on days ${dayList} from lead creation. Set DEFAULT_FOLLOWUP_TEMPLATE=${template.id} on the API.`,
    active: false,
    nodes,
    connections,
    settings: { executionOrder: "v1" },
    staticData: null,
    pinData: {},
  };
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const id of ["2day", "7day", "14day"] as FollowupTemplateId[]) {
    const template = FOLLOWUP_TEMPLATES[id];
    const workflow = buildWorkflow(template);
    const outPath = path.join(OUTPUT_DIR, `demo-follow-up-template-${id}.workflow.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(workflow, null, 2)}\n`);
    console.log(`Wrote ${outPath} (${template.touches.length} touches)`);
  }
}

main();
