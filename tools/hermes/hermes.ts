import fs from "node:fs";
import { Agent, CursorAgentError } from "@cursor/sdk";
import { parseFlags, getHermesPaths } from "./config";
import { appendNdjson, ensureDir } from "./logger";
import { postSlackRunSummary } from "./hooks/slack";
import { postGithubIssueComment } from "./hooks/github";

type State = { agentId: string };

function printHelp() {
  console.log(
    "Usage: npm run hermes -- [--resume|--new] [--approve-push] \"task\""
  );
}

function readState(stateFile: string): State | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(stateFile, "utf8")) as State;
    if (parsed?.agentId) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeState(stateFile: string, state: State) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), "utf8");
}

function getPushPolicy(approvePush: boolean): string {
  if (approvePush) {
    return "Push is allowed if requested, but never force-push.";
  }
  return "Do not push to remote under any circumstance.";
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const flags = parseFlags(args);
  const cwd = process.cwd();
  const paths = getHermesPaths(cwd);
  ensureDir(paths.stateDir);

  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY is required.");
  }

  const basePrompt = fs.existsSync(paths.promptFile)
    ? fs.readFileSync(paths.promptFile, "utf8")
    : "";

  const priorState = readState(paths.stateFile);
  const shouldResume =
    flags.resume || (!flags.isNew && priorState?.agentId != null);

  const fullPrompt = `${basePrompt}

Runtime policy:
- ${getPushPolicy(flags.approvePush)}

Task:
${flags.task}
`.trim();

  try {
    await using agent = shouldResume
      ? await Agent.resume(priorState!.agentId, { apiKey })
      : await Agent.create({
          apiKey,
          model: { id: "auto" },
          local: { cwd },
        });

    writeState(paths.stateFile, { agentId: agent.agentId });
    appendNdjson(paths.runLogFile, {
      level: "info",
      type: "agent_start",
      agentId: agent.agentId,
      resumed: shouldResume,
      approvePush: flags.approvePush,
    });

    const run = await agent.send(fullPrompt);
    appendNdjson(paths.runLogFile, {
      level: "info",
      type: "run_start",
      runId: run.id,
      agentId: agent.agentId,
      task: flags.task,
    });

    for await (const event of run.stream()) {
      if (event.type === "assistant") {
        for (const block of event.message.content) {
          if (block.type === "text") process.stdout.write(block.text);
        }
      }
    }

    const result = await run.wait();
    appendNdjson(paths.runLogFile, {
      level: "info",
      type: "run_end",
      runId: result.id,
      agentId: agent.agentId,
      status: result.status,
      durationMs: result.durationMs ?? null,
    });

    const summary =
      `Hermes run: ${result.status}\n` +
      `agentId: ${agent.agentId}\n` +
      `runId: ${result.id}\n` +
      `task: ${flags.task}`;

    await postSlackRunSummary({
      webhookUrl: process.env.HERMES_SLACK_WEBHOOK_URL,
      runId: result.id,
      agentId: agent.agentId,
      status: result.status,
      task: flags.task,
    });

    await postGithubIssueComment({
      token: process.env.GITHUB_TOKEN,
      repository: process.env.GITHUB_REPOSITORY,
      issueNumber: process.env.HERMES_GITHUB_ISSUE_NUMBER,
      body: "```text\n" + summary + "\n```",
    });

    console.log(`\n\nRun status: ${result.status}`);
    if (result.status === "error") process.exit(2);
  } catch (err) {
    if (err instanceof CursorAgentError) {
      appendNdjson(paths.runLogFile, {
        level: "error",
        type: "startup_error",
        message: err.message,
        retryable: err.isRetryable,
      });
      console.error(
        `Hermes startup failed: ${err.message} (retryable=${err.isRetryable})`
      );
      process.exit(1);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

