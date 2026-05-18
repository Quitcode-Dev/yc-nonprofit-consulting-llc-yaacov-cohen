"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type UserRole = "super_admin" | "org_admin" | "solicitor";

type UserProfile = {
  id: string;
  role: UserRole;
  is_active: boolean;
  organization_id: string | null;
};

type Organization = {
  id: string;
  is_active: boolean;
};

function getSafeRedirectPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [submitError, setSubmitError] = useState<string>("");

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

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, role, is_active, organization_id")
      .eq("id", userId)
      .single<UserProfile>();

    if (profileError || !profile) {
      setSubmitError("Invalid email or password");
      return;
    }

    if (!profile.is_active) {
      setSubmitError("Account deactivated");
      return;
    }

    if (
      (profile.role === "org_admin" || profile.role === "solicitor") &&
      profile.organization_id
    ) {
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("id, is_active")
        .eq("id", profile.organization_id)
        .single<Organization>();

      if (orgError || !organization) {
        setSubmitError("Organization deactivated");
        return;
      }

      if (!organization.is_active) {
        setSubmitError("Organization deactivated");
        return;
      }
    }

    const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));
    const roleDashboardPath =
      profile.role === "super_admin" ||
      profile.role === "org_admin" ||
      profile.role === "solicitor"
        ? "/dashboard"
        : "/dashboard";

    router.push(redirectTo ?? roleDashboardPath);
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
    </div>
  );
}
