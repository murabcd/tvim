import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { env } from "@/env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL || "http://localhost:3000",
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID as string,
			clientSecret: env.GITHUB_CLIENT_SECRET as string,
		},
	},
});

// Server-side session helper using Better Auth
export const getSession = async () => {
	try {
		// For TanStack Start with Better Auth, we'll use a simpler approach
		// The session will be handled by the client-side auth state
		// This function is mainly used for server-side operations

		// For now, return null to indicate no server-side session
		// The client-side useSession hook will handle the actual session state
		return null;
	} catch (error) {
		console.error("Error getting session:", error);
		return null;
	}
};
