import { signOut, useSession } from "@/lib/auth-client";

interface User {
	id: string;
	name: string;
	email: string;
	image?: string;
}

interface AuthState {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}

export function useAuth() {
	const { data: session, isPending: isLoading } = useSession();

	const handleSignOut = async () => {
		await signOut();
	};

	return {
		user: session?.user as User | null,
		isLoading,
		isAuthenticated: !!session?.user,
		signOut: handleSignOut,
	};
}