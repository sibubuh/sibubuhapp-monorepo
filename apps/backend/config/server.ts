export default ({ env }) => ({
	host: env("HOST", "0.0.0.0"),
	port: env.int("PORT", 3080),
	app: {
		keys: env.array("zUsQgeOM8kEFvj/B,QEqwlLRZHu5btPhN,qxxzhbgHSj1Ixzrb,2hM9j1NDmkKTK3RS"),
	},
});
