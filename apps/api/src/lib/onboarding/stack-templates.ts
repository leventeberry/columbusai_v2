/** Stack templates available at client conversion (mirrors admin mock platform). */
export const STACK_TEMPLATES = [
  {
    id: "tpl-basic",
    name: "Basic Website",
    description: "Static-friendly site with analytics. Ideal for marketing pages.",
    services: ["website", "analytics"],
  },
  {
    id: "tpl-automation",
    name: "Automation Stack",
    description: "Website plus database, cache, and n8n for back-office automation.",
    services: ["website", "postgres", "redis", "n8n", "analytics"],
  },
  {
    id: "tpl-ai",
    name: "AI Business Stack",
    description: "Full AI-native stack with vector DB and a managed AI agent.",
    services: ["website", "postgres", "redis", "n8n", "vector", "ai-agent", "analytics"],
  },
] as const;

export type StackTemplateId = (typeof STACK_TEMPLATES)[number]["id"];

export function isValidStackTemplateId(id: string): id is StackTemplateId {
  return STACK_TEMPLATES.some((t) => t.id === id);
}

export function defaultStackTemplateId(): StackTemplateId {
  return "tpl-basic";
}
