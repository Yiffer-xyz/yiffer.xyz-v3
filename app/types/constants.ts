import type { AdvertisementInfo } from './types';

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

export const COMIC_PROBLEM_CATEGORIES = [
  {
    title: 'Update missing',
    description:
      'The comic has been updated elsewhere, but not on Yiffer.xyz. Please provide links to the page(s).',
  },
  {
    title: 'Page order wrong',
    description: 'Please describe which pages are incorrectly ordered.',
  },
  {
    title: 'Low page resolution',
    description: `The comic exists in a greater resolution AVAILABLE TO THE PUBLIC. If only some pages are in a lower resolution, please describe which ones. Please provide a link to the higher res version of the comic. Note: Yiffer.xyz has a maximum page width of 1800 pixels, so there's no use in reporting comics that already have their pages 1800 pixels wide.`,
  },
  {
    title: 'Comic info wrong',
    description: `The comic's name, tag (MF/etc), wip/done state, or prev/next comic is wrong or missing. Please describe what is incorrect.`,
  },
  {
    title: 'Artist issue',
    description: `The comic's artist is wrong, or the artist has missing or no longer relevant links. Please include the links in question, or the correct artist name.`,
  },
  {
    title: 'Other',
    description: `Please describe the issue.`,
  },
];

export const MAX_UPLOAD_BODY_SIZE = 100 * 1024 * 1024; // 100MB

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
