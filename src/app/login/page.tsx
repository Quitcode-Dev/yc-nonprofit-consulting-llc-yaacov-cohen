"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;


function getSafeRedirectPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value === "/") return null;
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [submitError, setSubmitError] = useState<string>("");
  const [testLoginLoading, setTestLoginLoading] = useState<string | null>(null);

  const handleTestLogin = async (role: "super_admin" | "org_admin") => {
    setTestLoginLoading(role);
    try {
      const res = await fetch(`/api/auth/test-login?role=${role}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Test login failed");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        toast.error("Failed to sign in test user");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      toast.error("Test login failed");
    } finally {
      setTestLoginLoading(null);
    }
  };

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError("");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

    if (authError || !authData.user) {
      setSubmitError("Invalid email or password");
      return;
    }

    const userId = authData.user.id;

    const { data: userRole, error: profileError } = await supabase
      .from("user_roles")
      .select("id, role, is_active, organization_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (profileError || !userRole) {
      setSubmitError("Invalid email or password");
      return;
    }

    const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));
    router.push(redirectTo ?? "/dashboard");
  };

  return (
    <div className="mx-auto mt-20 w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

            {submitError ? (
              <p className="text-sm text-red-500">{submitError}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot Password?
          </Link>
        </CardFooter>
      </Card>

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Test Login
          </span>
          <Separator className="flex-1" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={testLoginLoading !== null}
            onClick={() => handleTestLogin("super_admin")}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <span className="text-xs font-semibold">Super Admin</span>
            <span className="text-[10px] text-muted-foreground font-normal">All organizations</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={testLoginLoading !== null}
            onClick={() => handleTestLogin("org_admin")}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <span className="text-xs font-semibold">Org Admin</span>
            <span className="text-[10px] text-muted-foreground font-normal">Demo Nonprofit</span>
          </Button>
        </div>
        {testLoginLoading && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            {testLoginLoading === "super_admin" ? "Signing in as Super Admin…" : "Signing in as Org Admin…"}
            {" "}This may take a moment on first use.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
