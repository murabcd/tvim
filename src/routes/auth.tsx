import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
	component: Auth,
	validateSearch: (search: Record<string, unknown>) => ({
		mode: search.mode === "register" ? "register" : "login",
		redirect: (search.redirect as string) || "/",
	}),
});

function Auth() {
	const navigate = useNavigate();
	const { mode, redirect } = useSearch({ from: "/auth" });
	const [currentMode, setCurrentMode] = useState<"login" | "register">(mode);
	const { isAuthenticated, isLoading } = useAuth();

	// Redirect if already authenticated
	if (isAuthenticated && !isLoading) {
		navigate({ to: redirect });
		return null;
	}

	const handleAuthSuccess = () => {
		navigate({ to: redirect });
	};

	const toggleMode = () => {
		const newMode = currentMode === "login" ? "register" : "login";
		setCurrentMode(newMode);
		navigate({
			to: "/auth",
			search: { mode: newMode, redirect },
			replace: true,
		});
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full">
				<AuthForm 
					mode={currentMode} 
					onSuccess={handleAuthSuccess}
					onToggleMode={toggleMode}
				/>
			</div>
		</div>
	);
}