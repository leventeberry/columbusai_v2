import path from "node:path";

export type HermesFlags = {
  resume: boolean;
  isNew: boolean;
  approvePush: boolean;
  task: string;
};

export function parseFlags(argv: string[]): HermesFlags {
  const resume = argv.includes("--resume");
  const isNew = argv.includes("--new");
  const approvePush = argv.includes("--approve-push");
  const cleaned = argv.filter((a) => !a.startsWith("--"));
  const task = cleaned.join(" ").trim();

  if (resume && isNew) {
    throw new Error("Use either --resume or --new, not both.");
  }
  if (!task) {
    throw new Error(
      'Usage: npm run hermes -- [--resume|--new] [--approve-push] "task"'
    );
  }
  return { resume, isNew, approvePush, task };
}

export function getHermesPaths(cwd: string) {
  const stateDir = path.join(cwd, "tools/hermes/state");
  return {
    stateDir,
    stateFile: path.join(stateDir, "agent-state.json"),
    runLogFile: path.join(stateDir, "runs.ndjson"),
    promptFile: path.join(cwd, "tools/hermes/prompts/system.md"),
  };
}

