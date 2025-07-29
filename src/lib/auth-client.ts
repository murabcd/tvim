import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
	baseURL: env.VITE_BASE_URL || "http://localhost:3000",
});
