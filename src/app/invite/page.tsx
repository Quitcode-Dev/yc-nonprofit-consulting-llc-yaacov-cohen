'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type ValidateResult =
  | { valid: true; email: string; organization_id: string }
  | { valid: false; reason: 'expired' | 'used' | 'not_found' };

type FormState = {
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

export default function InviteRegistrationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);
  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidateResult({ valid: false, reason: 'not_found' });
      setLoading(false);
      return;
    }

    async function validate() {
      try {
        const res = await fetch(`/api/invitations/validate?token=${encodeURIComponent(token!)}`);
        const data: ValidateResult = await res.json();
        setValidateResult(data);
      } catch {
        setValidateResult({ valid: false, reason: 'not_found' });
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [token]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validateForm(): FieldErrors {
    const errors: FieldErrors = {};

    if (!form.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!form.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (!form.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    } else if (form.password !== form.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    return errors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/invitations/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      // Auto-login the user with their new credentials
      const supabase = createClient();
      const email = validateResult && validateResult.valid ? validateResult.email : '';

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (signInError) {
        setSubmitError('Account created but sign-in failed. Please go to the login page.');
        setSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Validating invitation...</p>
      </div>
    );
  }

  if (!validateResult || !validateResult.valid) {
    const reason = validateResult?.reason;
    const message =
      reason === 'used'
        ? 'This link has already been used.'
        : reason === 'expired'
        ? 'This invitation link has expired.'
        : 'This invitation link is invalid.';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Invitation Invalid</h1>
          <p className="text-muted-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            Please contact your organization administrator to request a new invitation.
          </p>
        </div>
      </div>
    );
  }

  const { email } = validateResult;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Complete Your Registration</h1>
          <p className="text-sm text-muted-foreground">
            Set up your account to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email — read-only */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          {/* First name */}
          <div className="space-y-1">
            <label htmlFor="first_name" className="block text-sm font-medium text-foreground">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fieldErrors.first_name && (
              <p className="text-xs text-destructive">{fieldErrors.first_name}</p>
            )}
          </div>

          {/* Last name */}
          <div className="space-y-1">
            <label htmlFor="last_name" className="block text-sm font-medium text-foreground">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fieldErrors.last_name && (
              <p className="text-xs text-destructive">{fieldErrors.last_name}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
            <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
              <li className={form.password.length >= 8 ? 'text-green-600' : ''}>
                • At least 8 characters
              </li>
              <li className={/\d/.test(form.password) ? 'text-green-600' : ''}>
                • At least one number
              </li>
              <li className={/[^A-Za-z0-9]/.test(form.password) ? 'text-green-600' : ''}>
                • At least one special character
              </li>
            </ul>
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fieldErrors.confirm_password && (
              <p className="text-xs text-destructive">{fieldErrors.confirm_password}</p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
