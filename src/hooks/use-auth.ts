import { signOut, useSession } from "@/lib/auth-client";

interface User {
	id: string;
	name: string;
	email: string;
	image?: string;
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
