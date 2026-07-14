"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiClientError } from "@/lib/api";
import { HOME_BY_ROLE } from "@/lib/constants";
import { AppLogo } from "@/components/branding/AppLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Where the user was headed before being bounced here, if anywhere. */
  const nextPath = searchParams.get("next");

  // Already signed in (e.g. they hit /login directly with a live session).
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath ?? HOME_BY_ROLE[user.role]);
    }
  }, [isLoading, user, nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const signedIn = await login(email, password);
      // Roles that cannot read analytics must not land on the dashboard, which
      // is built entirely on the analytics endpoint and would 403 for them.
      router.replace(nextPath ?? HOME_BY_ROLE[signedIn.role]);
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught.message
          : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <AppLogo size={40} showLabel={false} />
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Sign in to TransitOps
            </h1>
            <p className="mt-1 text-sm text-muted">
              Dispatch, maintenance and fleet cost control.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 pt-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-status-suspended/40 bg-status-suspended/10 px-3 py-2 text-sm text-status-suspended"
                >
                  {error}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="fleet@transitops.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-2">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary to keep this route statically
  // renderable in the App Router.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
