// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
var app_config_default = defineConfig({
  ssr: true,
  server: {
    port: 3e3
  },
  routers: [
    {
      type: "static",
      dir: "./src/routes"
    }
  ]
});
export {
  app_config_default as default
};
