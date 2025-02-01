import type { UserSession } from '~/types/types';

export function shouldShowAdsForUser(user: UserSession | null | undefined) {
  if (!user || !user.patreonDollars) return true;
  return user.patreonDollars < 5;
}
