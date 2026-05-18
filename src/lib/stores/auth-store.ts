import { create } from 'zustand';
import { UserProfile } from '@/lib/types';

type AuthState = {
  user: UserProfile | null;
  isLoading: boolean;
  impersonatingOrgId: string | null;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setImpersonatingOrg: (orgId: string | null) => void;
  getEffectiveOrgId: () => string | null;
  isSuperAdmin: () => boolean;
  isOrgAdmin: () => boolean;
  isSolicitor: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  impersonatingOrgId: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setImpersonatingOrg: (orgId) => set({ impersonatingOrgId: orgId }),

  getEffectiveOrgId: () => {
    const { impersonatingOrgId, user } = get();
    return impersonatingOrgId ?? user?.organization_id ?? null;
  },

  isSuperAdmin: () => get().user?.role === 'super_admin',
  isOrgAdmin: () => get().user?.role === 'org_admin',
  isSolicitor: () => get().user?.role === 'solicitor',
}));
