import { createTanstackStartViteConfig } from "../../infra/vite/tanstack-start.ts";

export default createTanstackStartViteConfig({
  defaultPort: 3002,
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: { preset: "node-server" },
});
