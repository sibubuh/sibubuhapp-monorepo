module.exports = {
  apps: [
    {
      name: "strapi-backend",
      cwd: "/var/www/sibubuhapp/apps/backend",
      // Path absolut + interpreter "none". Dengan `script: "pnpm"`, pm2 salah
      // me-resolve dan akhirnya menjalankan `/usr/bin/bash --filter backend
      // start` — bash menolak `--filter` sebagai opsi dan Strapi tidak pernah
      // hidup. Pola ini menyalin konfigurasi app lain di server yang sudah
      // terbukti jalan berhari-hari.
      script: "/usr/bin/pnpm",
      // `start`, bukan `--filter backend start`: cwd sudah menunjuk ke paket
      // backend, jadi filter workspace tidak diperlukan.
      args: "start",
      interpreter: "none",
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
      // Pola yang sama dengan backend. Sebelumnya `script: "node"` membuat pm2
      // menyimpan path absolut milik satu versi Node di nvm, yang akan patah
      // begitu versi Node-nya berganti.
      script: "/usr/bin/pnpm",
      args: "start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
