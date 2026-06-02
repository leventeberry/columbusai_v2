import { createApis, createHostingerConfig } from "./lib/client";
import { loadHostingerEnv } from "./lib/env";
import { provisionDns } from "./lib/dns";

async function main() {
  const env = loadHostingerEnv();
  const config = createHostingerConfig(env);
  const { dns } = createApis(config);

  await provisionDns(dns, env.domain, env.vpsIp);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
