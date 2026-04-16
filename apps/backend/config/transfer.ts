export default {
  enabled: true,

  token: {
    salt: process.env.TRANSFER_TOKEN_SALT,
  },

  // 🔥 THIS PART IS MISSING
  remote: {
    enabled: true,
  },
};
