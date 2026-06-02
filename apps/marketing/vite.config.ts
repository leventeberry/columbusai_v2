import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTanstackStartViteConfig } from "../../infra/vite/tanstack-start.ts";

const marketingRoot = path.dirname(fileURLToPath(import.meta.url));
const leadsValidation = path.resolve(marketingRoot, "../../packages/leads/src/validation.ts");

export default createTanstackStartViteConfig({
  defaultPort: 3000,
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: { preset: "node-server" },
  vite: {
    resolve: {
      alias: {
        "@columbusai/leads/validation": leadsValidation,
      },
    },
  },
});
