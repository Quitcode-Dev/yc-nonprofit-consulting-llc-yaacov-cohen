import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export type UserRole = 'super_admin' | 'org_admin' | 'solicitor';

export interface UserProfile {
  id: string;
  role: UserRole;
  organization_id: string | null;
}

export class AuthorizationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = status;
  }
}

export async function getAuthenticatedUser(): Promise<{ user: User; profile: UserProfile }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AuthorizationError(401, 'Unauthorized');
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profile')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthorizationError(403, 'User profile not found');
  }

  return { user, profile: profile as UserProfile };
}

export function assertRole(profile: UserProfile, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(profile.role)) {
    throw new AuthorizationError(403, 'Forbidden');
  }
}

export function assertOrgAccess(profile: UserProfile, targetOrgId: string): void {
  if (profile.role === 'super_admin') {
    return;
  }

  if (profile.organization_id === targetOrgId) {
    return;
  }

  throw new AuthorizationError(403, 'Forbidden');
}

export function assertDonorAccess(profile: UserProfile, donorSolicitorId: string | null): void {
  if (profile.role === 'super_admin' || profile.role === 'org_admin') {
    return;
  }

  if (profile.role === 'solicitor' && donorSolicitorId !== null && profile.id === donorSolicitorId) {
    return;
  }

  throw new AuthorizationError(403, 'Forbidden');
}
