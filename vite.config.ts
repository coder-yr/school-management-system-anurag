import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(async ({ command }) => {
  const plugins = [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    react(),
    tailwindcss(),
  ];

  if (command === "build") {
    try {
      const { cloudflare } = await import("@cloudflare/vite-plugin");
      plugins.push(
        cloudflare({
          viteEnvironment: { name: "ssr" },
        }),
      );
    } catch (e) {
      console.warn("Could not load @cloudflare/vite-plugin", e);
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
        "~": `${process.cwd()}/src`,
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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("lucide-react")) {
                return "vendor-lucide";
              }
              if (id.includes("recharts") || id.includes("d3")) {
                return "vendor-charts";
              }
              if (id.includes("@supabase")) {
                return "vendor-supabase";
              }
              return "vendor";
            }
          },
        },
      },
    },
  };
});
