import type { AdvertisementInfo, ModActionType } from './types';

export const EMAIL_ENDPOINT = 'https://api.postmarkapp.com/email';

export const COMIC_CARD_BASE_WIDTH = 160;
export const COMIC_CARD_BASE_HEIGHT = 226;
export const COMIC_CARD_MAX_WIDTH = COMIC_CARD_BASE_WIDTH * 3;
export const COMIC_CARD_MAX_HEIGHT = COMIC_CARD_BASE_HEIGHT * 3;

export const CARD_AD_MAIN_TEXT_MAX_LENGTH = 25;
export const CARD_AD_SECONDARY_TEXT_MAX_LENGTH = 60;

export const COMICS_PER_PAGE = 60;
export const ADS_PER_PAGE = 6; // Will be either this (rare) or this-1 (usually)

export const defaultTitle = { title: 'Yiffer.xyz' };

export const DB_ANALYTICS_SAMPLE_RATE = 0.1;

export const MAX_USER_BIO_LENGTH = 300;
export const PROFILE_PIC_SIZE = 400;

export const MAX_COMMENT_LENGTH = 500;

export const R2_PROFILE_PICTURES_FOLDER = 'profile-photos';
export const R2_TEMP_FOLDER = 'temp';
export const R2_COMICS_FOLDER = 'comics';

export const R2_CONNECTION_LIMIT = 4;

export const COMIC_PROBLEM_CATEGORIES = [
  {
    title: 'Update missing',
    description:
      'For when the comic has been updated elsewhere, but not on Yiffer.xyz. Please provide links to the page(s).',
  },
  {
    title: 'Page order wrong',
    description: 'Please describe which pages are incorrectly ordered.',
  },
  {
    title: 'Low page resolution',
    description: `For when the comic exists in a greater resolution AVAILABLE TO THE PUBLIC. If only some pages are in a lower resolution, please describe which ones. Please provide a link to the higher res version of the comic. Note: Yiffer.xyz has a maximum page width of 1800 pixels, so there's no use in reporting comics that already have their pages 1800 pixels wide.`,
  },
  {
    title: 'Comic info wrong',
    description: `For when the comic's name, tag (MF/etc), wip/done state, or prev/next comic is wrong or missing. Please describe what is incorrect.`,
  },
  {
    title: 'Artist issue',
    description: `For when the comic's artist is wrong, or the artist has missing or no longer relevant links. Please include the links in question, or the correct artist name.`,
  },
  {
    title: 'Other',
    description: `Please describe the issue.`,
  },
];

export const MAX_UPLOAD_BODY_SIZE = 50 * 1024 * 1024; // 50MB

export const ADVERTISEMENTS: AdvertisementInfo[] = [
  {
    name: 'card',
    title: 'Comic card',
    shortTitle: 'Card',
    description: 'Shows up in the list of comics on the main browse page',
    freeTrialOffered: true,
    hasTexts: true,
    minDimensions: {
      width: COMIC_CARD_MAX_WIDTH,
      height: COMIC_CARD_MAX_HEIGHT,
    },
    pricesForMonths: {
      1: 14,
      4: 48, // 12 per month
      12: 120, // 10 per month
    },
  },
  {
    name: 'banner',
    title: 'Banner above comics',
    shortTitle: 'Comic banner',
    description: 'Wide banner at the top when viewing a comic',
    freeTrialOffered: true,
    hasTexts: false,
    minDimensions: {
      width: 728,
      height: 90,
    },
    alternativeDimensions: [
      { width: 728, height: 90 },
      { width: 728 * 1.5, height: 90 * 1.5 },
    ],
    idealDimensions: {
      width: 728 * 2,
      height: 90 * 2,
    },
    pricesForMonths: {
      1: 18,
      4: 64, // 16 per month
      12: 168, // 14 per month
    },
  },
  {
    name: 'topSmall',
    title: 'Browse top banner',
    shortTitle: 'Browse banner',
    description: 'Semi-wide banner at the top of the main browse page',
    freeTrialOffered: true,
    hasTexts: false,
    minDimensions: {
      width: 300,
      height: 90,
    },
    alternativeDimensions: [
      { width: 300, height: 90 },
      { width: 300 * 1.5, height: 90 * 1.5 },
    ],
    idealDimensions: {
      width: 300 * 2,
      height: 90 * 2,
    },
    pricesForMonths: {
      1: 20,
      4: 68, // 17 per month
      12: 168, // 14 per month
    },
  },
];

export const ADMIN_INSTRUCTIONS = [
  {
    id: 'modpanel',
    title: 'Mod panel',
    message: 'Quick intro to the new mod panel and how to use it',
  },
  {
    id: 'comics',
    title: 'Comic guidelines',
    message: "Comic content dos and don'ts",
  },
  {
    id: 'tagging',
    title: 'Tagging',
    message: 'How to tag comics correctly',
  },
];

export const ModActions: { [key in ModActionType]: { points: number; name: string } } = {
  'upload-processed': { points: 20, name: 'Upload processed' },
  'suggestion-processed': { points: 5, name: 'Suggestion processed' },
  'tagsuggestion-processed': { points: 5, name: 'Tag sugg. processed' },
  'problem-processed': { points: 5, name: 'Problem processed' },
  'comic-uploaded': { points: 150, name: 'Comic uploaded' },
  'comic-data-updated': { points: 10, name: 'Comic data updated' },
  'comic-tags-updated': { points: 15, name: 'Tags updated' },
  'comic-thumbnail-changed': { points: 30, name: 'Thumbnail changed' },
  'comic-pages-changed': { points: 30, name: 'Pages changed' },
  'artist-updated': { points: 10, name: 'Artist updated' },
  'tag-updated': { points: 20, name: 'Tag updated' },
  'pending-published': { points: 10, name: 'Pending published' },
  'comic-comment-report-processed': { points: 30, name: 'Comment report processed' },
};

export function getModActionPoints(actionType: ModActionType) {
  return ModActions[actionType].points;
}

export function getModActionName(actionType: ModActionType) {
  return ModActions[actionType].name;
}

export const SOCIALS = [
  {
    platform: 'Twitter',
    url: 'https://twitter.com/XXXX',
  },
  {
    platform: 'Bluesky',
    url: 'https://bsky.app/profile/XXXX',
  },
  {
    platform: 'Telegram',
    url: 'https://t.me/XXXX',
  },
  {
    platform: 'TikTok',
    url: 'https://www.tiktok.com/XXXX',
  },
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/XXXX',
  },
  {
    platform: 'Furaffinity',
    url: 'https://www.furaffinity.net/user/XXXX',
  },
  {
    platform: 'DeviantArt',
    url: 'https://www.deviantart.com/XXXX',
  },
  {
    platform: 'Inkbunny',
    url: 'https://www.inkbunny.net/XXXX',
  },
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/XXXX',
  },
  {
    platform: 'Linktree',
    url: 'https://linktr.ee/XXXX',
  },
];

export function getSocialUrl(platform: string, username: string) {
  return (
    SOCIALS.find(social => social.platform === platform)?.url.replace('XXXX', username) ??
    ''
  );
}

export const ADMIN_COMMENTLIST_PAGE_SIZE = 50;

export const MAX_PAGE_WIDTH = 1800;

export const NOTIFICATIONS_PAGINATION_SIZE = 6;

export const RESTRICT_NOTIFICATIONS_TO_PATRONS = true;

export const COMMENT_HIDE_THRESHOLD = -3;

export const MESSAGES_PAGINATION_SIZE = 50;
export const ADMIN_DASH_PAGINATION_CATEGORY_SIZE = 300;

export const THEME1 = '#9aebe7';
export const THEME1_DARK = '#49ded7';
export const THEME2 = '#adfee0';
export const THEME2_DARK = '#5df1ba';

export const MAX_MESSAGE_LENGTH = 1500;

export const ADMIN_CHAT_LIST_PAGESIZE = 50;

export const MAX_D1_QUERY_PARAMS = 80; // Real one is 100, but add some safety margin
