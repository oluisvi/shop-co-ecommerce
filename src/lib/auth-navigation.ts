export type ProfileRole = 'CUSTOMER' | 'SELLER';

type AuthNavigationInput = {
  authenticated: boolean;
  profileLoading: boolean;
  role: ProfileRole | null;
};

type NavigationLink = { href: string; label: string };

export function createProfileRequestGuard() {
  let latest = 0;
  return {
    begin: () => ++latest,
    invalidate: () => { latest += 1; },
    isCurrent: (request: number) => request === latest,
  };
}

export function getAuthNavigation(input: AuthNavigationInput): {
  account: NavigationLink;
  studio: NavigationLink | null;
} {
  const account = input.authenticated
    ? { href: '/account', label: 'Account' }
    : { href: '/auth/sign-in', label: 'Sign in' };
  const studio = input.authenticated && !input.profileLoading && input.role === 'SELLER'
    ? { href: '/studio', label: 'Studio' }
    : null;
  return { account, studio };
}
