import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import {
  defineConfig,
  loadEnv,
  mergeConfig,
  type PluginOption,
  type UserConfig,
} from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export type TanstackStartViteOptions = {
  /** Default when PORT unset (marketing 3000, portal 3001, admin 3002). */
  defaultPort?: number;
  tanstackStart?: Record<string, unknown>;
  nitro?: { preset?: string } | true | false;
  react?: Record<string, unknown>;
  /** Set false to skip VITE_* define injection. */
  envDefine?: boolean;
  vite?: UserConfig;
};

const tanstackStartDefaults = {
  importProtection: {
    behavior: "error",
    client: {
      files: ["**/server/**"],
      specifiers: ["server-only"],
    },
  },
};

/**
 * Hand-rolled TanStack Start + Nitro Vite config (replaces @lovable.dev/vite-tanstack-config).
 * Call from each app's vite.config.ts; Vite runs with cwd = app root.
 */
export function createTanstackStartViteConfig(options: TanstackStartViteOptions = {}) {
  return defineConfig(async ({ command, mode }) => {
    const plugins: PluginOption[] = [
      tailwindcss(),
      viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    ];

    const tanstackStartOptions = mergeConfig(
      tanstackStartDefaults,
      options.tanstackStart ?? {},
    );
    plugins.push(tanstackStart(tanstackStartOptions));

    const explicitNitro =
      options.nitro === true ||
      (typeof options.nitro === "object" && options.nitro !== null);
    const shouldRunNitro =
      options.nitro !== false && command === "build" && explicitNitro;

    if (shouldRunNitro) {
      const userNitroOpts =
        typeof options.nitro === "object" && options.nitro ? options.nitro : {};
      plugins.push(
        nitro({
          preset: "node-server",
          output: {
            dir: "dist",
            serverDir: "dist/server",
            publicDir: "dist/client",
          },
          ...userNitroOpts,
        }),
      );
    }

    plugins.push(viteReact(options.react));

    let envDefine: Record<string, string> = {};
    if (options.envDefine !== false) {
      const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
      for (const [key, value] of Object.entries(loadedEnv)) {
        envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
      }
    }

    const defaultPort = options.defaultPort ?? 3000;
    const port = Number(process.env.PORT) || defaultPort;

    let config: UserConfig = {
      define: envDefine,
      css: { transformer: "lightningcss" },
      resolve: {
        alias: {
          "@": `${process.cwd()}/src`,
        },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@tanstack/react-query",
          "@tanstack/query-core",
        ],
      },
      server: {
        host: true,
        port,
        strictPort: false,
      },
      plugins,
    };

    if (options.vite) {
      config = mergeConfig(config, options.vite);
    }

    return config;
  });
}
