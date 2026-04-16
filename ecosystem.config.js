module.exports = {
  apps: [
    {
      name: "strapi-backend",
      cwd: "./apps/backend",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3080,
      },
    },
    {
      name: "frontend",
      cwd: "./apps/frontend",
      script: "pnpm",
      args: "preview",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
