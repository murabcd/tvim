import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="text-center space-y-6">
				<div className="space-y-2">
					<h1 className="text-6xl font-bold text-foreground">404</h1>
					<h2 className="text-2xl font-semibold text-muted-foreground">
						Page Not Found
					</h2>
					<p className="text-muted-foreground">
						The page you're looking for doesn't exist.
					</p>
				</div>
				<Link
					to="/"
					className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
				>
					Go home
				</Link>
			</div>
		</div>
	);
}
