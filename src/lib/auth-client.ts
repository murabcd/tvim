import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: env.BASE_URL,
});
