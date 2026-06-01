type GithubArgs = {
  token?: string;
  repository?: string;
  issueNumber?: string;
  body: string;
};

export async function postGithubIssueComment(args: GithubArgs) {
  if (!args.token || !args.repository || !args.issueNumber) return;

  const url = `https://api.github.com/repos/${args.repository}/issues/${args.issueNumber}/comments`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "hermes-runner",
    },
    body: JSON.stringify({ body: args.body }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub comment failed: ${res.status} ${text}`);
  }
}

