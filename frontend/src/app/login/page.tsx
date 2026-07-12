"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { AppLogo } from "@/components/branding/AppLogo";

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginForm />
		</Suspense>
	);
}

function LoginForm() {
	const { login } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const expired = searchParams.get("expired") === "1";

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			const user = await login({ email, password });
			toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
			router.push(searchParams.get("next") ?? "/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="relative grid min-h-screen lg:grid-cols-2">
			<div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
				<AnimatedThemeToggler
					className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface/80 text-foreground backdrop-blur transition-colors hover:border-border-strong hover:bg-surface"
					aria-label="Toggle theme"
					variant="circle"
					fromCenter
				/>
			</div>
			<div className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-10">
				<RoutePathBackdrop />

				<div className="relative z-10 flex items-center gap-2">
					<AppLogo size={32} labelClassName="text-lg" />
				</div>

				<div className="relative z-10 max-w-sm space-y-3">
					<p className="font-display text-2xl font-medium leading-snug text-foreground">
						Every vehicle, driver, and trip, one operations console.
					</p>
					<p className="text-sm text-muted">
						Dispatch, maintenance, and cost tracking without the spreadsheets.
					</p>
					<Button asChild variant="secondary" size="sm" className="mt-2 w-fit">
						<Link href="/">Back to landing page</Link>
					</Button>
				</div>

				<p className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-muted-2">
					Fleet · Driver · Safety · Finance
				</p>
			</div>

			<div className="flex items-center justify-center bg-background p-6">
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
					className="w-full max-w-sm"
				>
					<div className="mb-8 flex items-center gap-2 lg:hidden">
						<AppLogo size={32} labelClassName="text-lg" />
					</div>

					<h1 className="font-display text-xl font-semibold text-foreground">Sign in to your console</h1>
					<p className="mt-1 text-sm text-muted">
						Use the credentials issued by your fleet administrator.
					</p>

					{expired && (
						<div className="mt-4 rounded-md border border-status-shop/40 bg-status-shop/10 px-3 py-2 text-xs text-status-shop">
							Your session expired. Please sign in again.
						</div>
					)}

					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@fleetco.com"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
							/>
						</div>

						{error && (
							<p className="text-sm text-status-suspended" role="alert">
								{error}
							</p>
						)}

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Signing in…
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>
				</motion.div>
			</div>
		</div>
	);
}

function RoutePathBackdrop() {
	return (
		<svg
			className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
			viewBox="0 0 400 600"
			fill="none"
			aria-hidden="true"
		>
			<motion.path
				d="M -20 500 C 80 500, 100 380, 180 360 S 280 300, 260 200 S 340 80, 420 60"
				stroke="var(--accent)"
				strokeWidth="2"
				strokeDasharray="6 10"
				initial={{ pathLength: 0 }}
				animate={{ pathLength: 1 }}
				transition={{ duration: 2.4, ease: "easeInOut" }}
			/>
			<circle cx="180" cy="360" r="4" fill="var(--accent)" />
			<circle cx="260" cy="200" r="4" fill="var(--accent)" />
		</svg>
	);
}