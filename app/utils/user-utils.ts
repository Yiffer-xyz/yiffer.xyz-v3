import { MAX_USER_BIO_LENGTH, SOCIALS } from '~/types/constants';
import type { PublicUser, User, UserSession } from '~/types/types';
import countryList from 'react-select-country-list';

export function shouldShowAdsForUser(user: UserSession | null | undefined) {
  if (!user || !user.patreonDollars) return true;
  return user.patreonDollars < 5;
}

export function fullUserToPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    userType: user.userType,
    createdTime: user.createdTime,
    patreonDollars: user.patreonDollars,
    bio: user.bio,
    nationality: user.nationality,
    socialLinks: user.socialLinks,
    contributionPoints: user.contributionPoints ?? 0,
    profilePictureToken: user.profilePictureToken,
  };
}

const socialPlatforms = SOCIALS.map(s => s.platform);

export function validatePublicUser(user: PublicUser): { error: string | null } {
  if (user.bio && user.bio.length > MAX_USER_BIO_LENGTH) {
    return { error: `Bio is too long` };
  }

  if (user.nationality) {
    if (
      !countryList()
        .getData()
        .find(c => c.value === user.nationality)
    ) {
      return { error: `Invalid nationality` };
    }
  }

  if (user.socialLinks.length > 0) {
    for (const social of user.socialLinks) {
      if (!socialPlatforms.includes(social.platform)) {
        return { error: `Invalid social platform: ${social.platform}` };
      }
      if (social.username.length === 0 || social.username.length > 60) {
        return { error: `Username too long: ${social.username}` };
      }
    }
  }

  return { error: null };
}
