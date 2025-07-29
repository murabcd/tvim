import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export function Header() {
	const { user, isAuthenticated, isLoading, signOut } = useAuth();

	return (
		<header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<Link to="/" className="text-xl font-bold text-foreground">
					<Icons.tvim className="w-6 h-6" />
				</Link>

				<div className="flex items-center gap-4">
					{isLoading ? (
						<div className="text-sm text-muted-foreground">Loading...</div>
					) : isAuthenticated && user ? (
						<div className="flex items-center gap-3">
							<span className="text-sm text-foreground">
								Welcome, {user.name}
							</span>
							<Button
								onClick={signOut}
								variant="ghost"
								size="sm"
								className="text-destructive hover:text-destructive"
							>
								Sign Out
							</Button>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<Button asChild variant="ghost" size="sm">
								<Link to="/auth" search={{ mode: "login", redirect: "/" }}>
									Sign In
								</Link>
							</Button>
							<Button asChild size="sm">
								<Link to="/auth" search={{ mode: "register", redirect: "/" }}>
									Sign Up
								</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
