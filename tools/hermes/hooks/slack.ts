export async function postSlackRunSummary(args: {
  webhookUrl?: string;
  runId: string;
  agentId: string;
  status: string;
  task: string;
}) {
  if (!args.webhookUrl) return;

  const text =
    `Hermes run finished\n` +
    `status: ${args.status}\n` +
    `agentId: ${args.agentId}\n` +
    `runId: ${args.runId}\n` +
    `task: ${args.task}`;

  await fetch(args.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(10000),
  });
}

