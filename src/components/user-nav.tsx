import { ChevronsUpDown, Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
	const { user, signOut } = useAuth();
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		// Get initial theme
		const isDark = document.documentElement.classList.contains("dark");
		setTheme(isDark ? "dark" : "light");
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);

		// Update localStorage and DOM
		localStorage.theme = newTheme;
		document.documentElement.classList.toggle("dark", newTheme === "dark");
	};

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
				>
					<Avatar className="h-6 w-6 border">
						<AvatarImage src={user.image} alt={user.name} />
						<AvatarFallback className="text-xs">
							{user.name?.charAt(0) ?? user.email?.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<span className="truncate">{user.name ?? user.email}</span>
					<ChevronsUpDown className="h-4 w-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuItem
					className="cursor-pointer"
					onSelect={(e) => {
						e.preventDefault();
						toggleTheme();
					}}
				>
					{theme === "light" ? (
						<Moon className="h-4 w-4 mr-2" />
					) : (
						<Sun className="h-4 w-4 mr-2" />
					)}
					<span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer"
					variant="destructive"
					onSelect={(e) => {
						e.preventDefault();
						signOut();
					}}
				>
					<LogOut className="h-4 w-4 mr-2" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
