import { useState } from "react";

import { cn } from "@/lib/utils";
import { signIn, signUp } from "@/lib/auth-client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface AuthFormProps {
	mode: "login" | "register";
	onSuccess?: () => void;
	onToggleMode?: () => void;
	className?: string;
}

export function AuthForm({
	mode,
	onSuccess,
	onToggleMode,
	className,
	...props
}: AuthFormProps & React.ComponentProps<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			if (mode === "register") {
				await signUp.email({
					email,
					password,
					name,
				});
			} else {
				await signIn.email({
					email,
					password,
				});
			}
			onSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGithubLogin = async () => {
		setIsLoading(true);
		try {
			await signIn.social({
				provider: "github",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>
						{mode === "login" ? "Login to your account" : "Create your account"}
					</CardTitle>
					<CardDescription>
						{mode === "login"
							? "Enter your email below to login to your account"
							: "Enter your details below to create your account"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							{mode === "register" && (
								<div className="grid gap-3">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										placeholder="Enter your name"
									/>
								</div>
							)}

							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									placeholder="Enter your email"
								/>
							</div>

							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
									{mode === "login" && (
										<a
											href="#"
											className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
										>
											Forgot your password?
										</a>
									)}
								</div>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									placeholder="Enter your password"
								/>
							</div>

							{error && (
								<div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
									{error}
								</div>
							)}

							<div className="flex flex-col gap-3">
								<Button type="submit" disabled={isLoading} className="w-full">
									{isLoading
										? "Loading..."
										: mode === "login"
											? "Login"
											: "Create Account"}
								</Button>
								<Button
									type="button"
									onClick={handleGithubLogin}
									disabled={isLoading}
									variant="outline"
									className="w-full"
								>
									<Icons.github className="w-4 h-4" />
									{mode === "login"
										? "Login with GitHub"
										: "Sign up with GitHub"}
								</Button>
							</div>
						</div>
						{onToggleMode && (
							<div className="mt-4 text-center text-sm">
								{mode === "login" ? (
									<>
										Don&apos;t have an account?{" "}
										<button
											type="button"
											onClick={onToggleMode}
											className="underline underline-offset-4 hover:text-primary"
										>
											Sign up
										</button>
									</>
								) : (
									<>
										Already have an account?{" "}
										<button
											type="button"
											onClick={onToggleMode}
											className="underline underline-offset-4 hover:text-primary"
										>
											Sign in
										</button>
									</>
								)}
							</div>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
