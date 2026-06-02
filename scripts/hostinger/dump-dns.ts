import { createApis, createHostingerConfig } from "./lib/client";
import { loadHostingerEnv } from "./lib/env";

async function main() {
  const env = loadHostingerEnv();
  const { dns } = createApis(createHostingerConfig(env));
  const records = await dns.getDNSRecordsV1(env.domain).then((r) => r.data ?? []);
  const hosts = new Set(["@", "www", "api", "admin", "portal", "n8n"]);
  for (const rec of records) {
    if (hosts.has(rec.name) || rec.name.includes("api")) {
      console.log(
        `${rec.name}\t${rec.type}\t${rec.records?.map((x) => x.content).join(" | ")}`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
