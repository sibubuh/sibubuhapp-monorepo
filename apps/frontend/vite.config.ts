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
	build: {
		rollupOptions: {
			output: {
				/**
				 * Without this the app shipped as one 453KB entry chunk that blocked
				 * the main thread for 715ms. Pulling the three large dependencies
				 * into their own chunks lets the browser parse them in parallel with
				 * the route code and keeps them cached across releases that only
				 * touch application code.
				 */
				manualChunks(id) {
					if (!id.includes("node_modules")) return;
					if (/node_modules\/(react|react-dom|scheduler)\//.test(id))
						return "vendor-react";
					if (id.includes("node_modules/@tanstack/")) return "vendor-tanstack";
					if (/node_modules\/(motion|framer-motion)/.test(id))
						return "vendor-motion";
				},
			},
		},
	},
	ssr: {
		external: [],
	},
	optimizeDeps: {
		exclude: ["@repo/shared-ui"],
	},
}));
