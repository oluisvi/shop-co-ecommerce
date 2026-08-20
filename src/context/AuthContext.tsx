import type { Session, User } from '@supabase/supabase-js';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { getAccountProfile, type AccountProfile } from '@/lib/api/account';
import { createProfileRequestGuard, type ProfileRole } from '@/lib/auth-navigation';

const supabase = createSupabaseBrowserClient();

type AuthValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accessToken: string | null;
  profile: AccountProfile | null;
  role: ProfileRole | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const profileRequests = useRef(createProfileRequestGuard());

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      profileRequests.current.invalidate();
      setProfile(null);
      setSession(nextSession);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const refreshProfile = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!accessToken) { profileRequests.current.invalidate(); setProfile(null); setProfileLoading(false); return; }
    const request = profileRequests.current.begin();
    setProfileLoading(true);
    try {
      const nextProfile = await getAccountProfile(accessToken);
      if (profileRequests.current.isCurrent(request)) setProfile(nextProfile);
    } catch {
      if (profileRequests.current.isCurrent(request)) setProfile(null);
    } finally {
      if (profileRequests.current.isCurrent(request)) setProfileLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { void refreshProfile(); }, [refreshProfile]);

  const value = useMemo<AuthValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    accessToken: session?.access_token ?? null,
    profile,
    role: profile?.role ?? null,
    profileLoading,
    refreshProfile,
    signOut: async () => { if (supabase) await supabase.auth.signOut(); },
  }), [session, loading, profile, profileLoading, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export { supabase };
