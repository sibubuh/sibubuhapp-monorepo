import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { env } from "std-env";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isTestOrStorybook = env.VITEST || process.argv[1]?.includes("storybook");

export default defineConfig(() => ({
	envPrefix: "VITE_",
	plugins: [
		tsconfigPaths(),
		!isTestOrStorybook &&
			tanstackStart(),
		tailwindcss(),
		react(),
	],
	server: { port: 3000, host: "0.0.0.0" },
	publicDir: resolve("public"),
	optimizeDeps: {
		exclude: ["@repo/shared-ui"],
	},
}));
