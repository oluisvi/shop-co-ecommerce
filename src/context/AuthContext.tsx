import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase';
import {
  getAccountProfile,
  type AccountProfile,
} from '@/lib/api/account';

import {
  createProfileRequestGuard,
  type ProfileRole,
} from '@/lib/auth-navigation';

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

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] =
    useState<AccountProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const profileRequests = useRef(
    createProfileRequestGuard(),
  );

  /*
   * Keep track of the authenticated identity separately
   * from the Supabase Session object.
   *
   * Supabase may emit auth events when:
   * - the tab regains focus;
   * - a token is refreshed;
   * - the same user session is re-emitted.
   *
   * Those events must NOT temporarily remove the
   * authenticated user's application profile.
   */
  const currentUserId = useRef<string | null>(null);
  const currentAccessToken = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    /*
     * Restore persisted Supabase session.
     */
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        const nextSession = data.session;

        currentUserId.current =
          nextSession?.user.id ?? null;

        currentAccessToken.current =
          nextSession?.access_token ?? null;

        setSession(nextSession);

        /*
         * If a session exists, the application profile
         * still needs to be resolved before authorization
         * decisions are made.
         */
        setProfileLoading(Boolean(nextSession));

        setLoading(false);
      });

    /*
     * Observe real auth changes without treating every
     * Supabase event as a different user.
     */
    const { data } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          const nextUserId =
            nextSession?.user.id ?? null;

          const nextAccessToken =
            nextSession?.access_token ?? null;

          const userChanged =
            currentUserId.current !== nextUserId;

          const tokenChanged =
            currentAccessToken.current !==
            nextAccessToken;

          currentUserId.current = nextUserId;
          currentAccessToken.current =
            nextAccessToken;

          /*
           * Real logout.
           */
          if (!nextSession) {
            profileRequests.current.invalidate();

            setSession(null);
            setProfile(null);
            setProfileLoading(false);
            setLoading(false);

            return;
          }

          /*
           * Real account change.
           *
           * Only here should the previous application
           * profile be discarded immediately.
           */
          if (userChanged) {
            profileRequests.current.invalidate();

            setProfile(null);
            setProfileLoading(true);
          } else if (tokenChanged) {
            /*
             * Same user, refreshed token.
             *
             * Preserve the known profile/role while the
             * fresh profile request is performed.
             *
             * This prevents SELLER -> null -> redirect
             * flicker when returning to the browser tab.
             */
            profileRequests.current.invalidate();
            setProfileLoading(true);
          }

          /*
           * If neither identity nor token changed,
           * preserve both profile and profile loading
           * state. Supabase can emit repeated SIGNED_IN
           * events for the same active session.
           */
          setSession(nextSession);
          setLoading(false);
        },
      );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const accessToken =
      session?.access_token;

    if (!accessToken) {
      profileRequests.current.invalidate();

      setProfile(null);
      setProfileLoading(false);

      return;
    }

    const request =
      profileRequests.current.begin();

    setProfileLoading(true);

    try {
      const nextProfile =
        await getAccountProfile(accessToken);

      if (
        profileRequests.current.isCurrent(request)
      ) {
        setProfile(nextProfile);
      }
    } catch {
      /*
       * Preserve an already resolved profile during a
       * temporary refresh/network failure.
       *
       * Backend SellerGuard remains authoritative for
       * protected Studio operations.
       *
       * If no profile has ever been resolved, it remains
       * null naturally.
       */
    } finally {
      if (
        profileRequests.current.isCurrent(request)
      ) {
        setProfileLoading(false);
      }
    }
  }, [session?.access_token]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,

      accessToken:
        session?.access_token ?? null,

      profile,

      role:
        profile?.role ?? null,

      profileLoading,

      refreshProfile,

      signOut: async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }
      },
    }),
    [
      session,
      loading,
      profile,
      profileLoading,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return value;
}

export { supabase };
