export default ({ env }) => {
	return {
		email: {
			config: {
				provider: "nodemailer",
				providerOptions: {
					host: env("SMTP_HOST", "localhost"),
					port: env("SMTP_PORT", 1025),
					auth: {
						user: env("SMTP_USERNAME"),
						pass: env("SMTP_PASSWORD"),
					},
					ignoreTLS: process.env.NODE_ENV === "development",
				},
				settings: {
					defaultFrom: env("SMTP_EMAIL_FROM", "admin@example.com"),
					defaultReplyTo: env("SMTP_REPLY_TO", "admin@example.com"),
				},
			},
		},
	};
};
