"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { IconBrandGoogle, IconArrowRight } from "@tabler/icons-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

type AuthMode = "signin" | "signup";

interface AuthCardProps {
  redirect?: string;
}

export function AuthCard({ redirect = "/" }: AuthCardProps) {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useFirebaseAuth();

  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleModeChange = (value: AuthMode) => {
    setMode(value);
    setError(null);
    setPassword("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password, redirect);
      } else {
        await signUpWithEmail(email, password, redirect);
      }
      router.replace(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle(redirect);
      router.replace(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs
      value={mode}
      onValueChange={(value) => handleModeChange(value as AuthMode)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign in</TabsTrigger>
        <TabsTrigger value="signup">Create account</TabsTrigger>
      </TabsList>

      <TabsContent value="signin" className="mt-6">
        <AuthForm
          mode="signin"
          email={email}
          password={password}
          error={error}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onModeSwitch={handleModeChange}
          onGoogle={handleGoogle}
          redirect={redirect}
        />
      </TabsContent>

      <TabsContent value="signup" className="mt-6">
        <AuthForm
          mode="signup"
          email={email}
          password={password}
          error={error}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onModeSwitch={handleModeChange}
          onGoogle={handleGoogle}
          redirect={redirect}
        />
      </TabsContent>
    </Tabs>
  );
}

interface AuthFormProps {
  mode: AuthMode;
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  redirect: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onModeSwitch: (mode: AuthMode) => void;
  onGoogle: () => void;
}

function AuthForm({
  mode,
  email,
  password,
  error,
  loading,
  redirect,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onModeSwitch,
  onGoogle,
}: AuthFormProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow">
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={onGoogle}
          disabled={loading}
        >
          <IconBrandGoogle aria-hidden className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>Email</Label>
            <Input
              id={`${mode}-email`}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-password`}>Password</Label>
            <Input
              id={`${mode}-password`}
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              minLength={8}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            {mode === "signin" ? (
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => alert("Password reset coming soon.")}
              >
                Forgot password?
              </button>
            ) : (
              <span className="text-muted-foreground">
                By continuing you agree to our {" "}
                <Link href="#" className="underline underline-offset-4">
                  Terms
                </Link>{" "}
                and {" "}
                <Link href="#" className="underline underline-offset-4">
                  Privacy
                </Link>
                .
              </span>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {mode === "signin" ? "Sign in" : "Create account"}
            <IconArrowRight className="ml-2 h-4 w-4 opacity-80" />
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              New here? {" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => onModeSwitch("signup")}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account? {" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => onModeSwitch("signin")}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
