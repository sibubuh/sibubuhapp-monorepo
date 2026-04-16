module.exports = {
  apps: [
    {
      name: "strapi-backend",
      cwd: "/var/www/sibubuhapp/apps/backend",
      script: "pnpm",
      args: "--filter backend start",
      env: {
        NODE_ENV: "production",
        PORT: 3080,

        // 🔥 MOVE HERE
        TRANSFER_TOKEN_SALT: "j9MyhvK6ckvjONrk",
        STRAPI_DISABLE_REMOTE_DATA_TRANSFER: "false",
      },
    },
    {
      name: "frontend",
      cwd: "/var/www/sibubuhapp/apps/frontend",
      script: "node",
      args: ".output/server/index.mjs",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
