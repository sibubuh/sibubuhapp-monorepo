export default ({ env }) => ({
	auth: {
		secret: env("nI1/5H4b5+Ue7NC3"),
	},
	apiToken: {
		salt: env("ouNwUsG8WXNe7nWs"),
	},
	transfer: {
		token: {
			salt: env("j9MyhvK6ckvjONrk"),
		},
	},
	flags: {
		nps: env.bool("FLAG_NPS", false),
		promoteEE: env.bool("FLAG_PROMOTE_EE", false),
	},
});
