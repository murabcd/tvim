import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.string().url().optional(),
		GITHUB_CLIENT_ID: z.string().optional(),
		GITHUB_CLIENT_SECRET: z.string().optional(),
	},
	runtimeEnv: {
		...process.env,
	},
	emptyStringAsUndefined: true,
});
