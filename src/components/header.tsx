import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { UserNav } from "@/components/user-nav";

export function Header() {
	const { user, isAuthenticated, isLoading } = useAuth();

	return (
		<header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-2">
			<div className="max-w-5xl mx-auto flex items-center justify-between">
				<Link
					to="/"
					className="flex items-center gap-1 text-xl font-bold text-foreground"
				>
					<Icons.tvim className="w-6 h-6" />
					<span>TVIM</span>
					<span className="hidden md:block text-muted-foreground text-xs font-normal ml-2">
						Vim Mode To Do List
					</span>
				</Link>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-8 w-16" />
						</div>
					) : isAuthenticated && user ? (
						<UserNav />
					) : (
						<div className="flex items-center gap-2">
							<Button asChild variant="ghost" size="sm">
								<Link to="/auth" search={{ mode: "login", redirect: "/" }}>
									Log in
								</Link>
							</Button>
							<Button asChild size="sm">
								<Link to="/auth" search={{ mode: "register", redirect: "/" }}>
									Sign up
								</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
