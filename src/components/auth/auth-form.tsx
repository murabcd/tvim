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
import { useNavigate } from "@tanstack/react-router";

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
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isEmailLoading, setIsEmailLoading] = useState(false);
	const [isGithubLoading, setIsGithubLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsEmailLoading(true);
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
			setIsEmailLoading(false);
		}
	};

	const handleGithubLogin = async () => {
		setIsGithubLoading(true);
		setError(null);
		try {
			await signIn.social({
				provider: "github",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsGithubLoading(false);
		}
	};

	const handleLogoClick = () => {
		navigate({ to: "/" });
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<div className="flex justify-center">
				<button
					type="button"
					onClick={handleLogoClick}
					className="hover:opacity-80 transition-opacity cursor-pointer"
					aria-label="Go to home page"
				>
					<Icons.tvim className="w-12 h-12 text-primary" />
				</button>
			</div>
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
										<button
											type="button"
											className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
										>
											Forgot your password?
										</button>
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
								<Button
									type="submit"
									disabled={isEmailLoading || isGithubLoading}
									className="w-full cursor-pointer"
								>
									{isEmailLoading
										? "Loading..."
										: mode === "login"
											? "Log in"
											: "Create Account"}
								</Button>
								<Button
									type="button"
									onClick={handleGithubLogin}
									disabled={isEmailLoading || isGithubLoading}
									variant="outline"
									className="w-full cursor-pointer"
								>
									{isGithubLoading ? (
										<>
											<Icons.github className="w-4 h-4" />
											Loading...
										</>
									) : (
										<>
											<Icons.github className="w-4 h-4 mr-2" />
											{mode === "login"
												? "Log in with GitHub"
												: "Sign up with GitHub"}
										</>
									)}
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
											className="underline underline-offset-4 hover:text-primary cursor-pointer"
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
											className="underline underline-offset-4 hover:text-primary cursor-pointer"
										>
											Log in
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
