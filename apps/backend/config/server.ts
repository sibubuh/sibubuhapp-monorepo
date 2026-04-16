module.exports = ({ env }) => ({
	host: "0.0.0.0",
	port: env.int("PORT", 3080),
	url: env("BASE_URL"),
	proxy: {
		koa: true,
	},
	app: {
		keys: env.array("APP_KEYS"),
	},
	transfer: {
		enabled: true,
		remote: {
			enabled: true,
		},
		token: {
			salt: env("TRANSFER_TOKEN_SALT"),
		},
	},
});
