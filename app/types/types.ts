// This is a combination of env variables found in .dev.vars and the
// other bindings such as R2, D1 sql, created locally through runtime
// arguments (see package.json, --r2=<BUCKET> etc).
export interface Env {
  FRONT_END_URL_BASE: string;
  IMAGES_SERVER_URL: string;
  PAGES_PATH: string;
  ADS_PATH: string;
  JWT_CONFIG_STR: string;
  POSTMARK_TOKEN: string;
  DAILY_SCHEDULE_PUBLISH_COUNT: string;
  DB: D1Database;
}

export type Artist = {
  id: number;
  name: string;
  patreonName: string;
  e621Name: string;
  isPending: boolean;
  isBanned: boolean;
  isRejected: boolean;
  links: string[];
};

export type ArtistTiny = {
  id: number;
  name: string;
  e621Name: string;
  patreonName: string;
  isPending: boolean;
  isBanned: boolean;
};

export type Category = 'M' | 'F' | 'MF' | 'MM' | 'FF' | 'MF+' | 'I';
export type CategoryWithAll = Category | 'All';
export const allCategories: CategoryWithAll[] = ['M', 'F', 'MF', 'MM', 'FF', 'MF+', 'I'];

export function isCategory(category: string): category is CategoryWithAll {
  return ['M', 'F', 'MF', 'MM', 'FF', 'MF+', 'I', 'All'].includes(category);
}

export type Comic = {
  name: string;
  id: number;
  state: 'wip' | 'cancelled' | 'finished';
  publishStatus: ComicPublishStatus;
  category: Category;
  numberOfPages: number;
  isBookmarked?: boolean;
  yourStars?: number;
  sumStars: number;
  avgStarsPercent: number;
  numTimesStarred: number;
  previousComic?: {
    id: number;
    name: string;
  };
  nextComic?: {
    id: number;
    name: string;
  };
  artist: {
    id: number;
    name: string;
    isPending: boolean;
  };
  tags: Tag[];
  published?: Date;
  updated?: Date;
  metadata?: ComicMetadata;
};

export type ComicForBrowse = {
  id: number;
  name: string;
  category: Category;
  artistName: string;
  updated: Date;
  published: Date;
  publishStatus: ComicPublishStatus;
  numberOfPages: number;
  state: 'wip' | 'cancelled' | 'finished';
  yourStars?: number;
  isBookmarked?: boolean;
  sumStars: number;
  avgStarsPercent: number;
  numTimesStarred: number;
  tags?: Tag[];
};

export type ComicPublishStatus =
  | 'published'
  | 'pending'
  | 'uploaded'
  | 'rejected'
  | 'rejected-list'
  | 'scheduled'
  | 'unlisted';

export type ComicTiny = {
  id: number;
  name: string;
  publishStatus: ComicPublishStatus;
  temp_hasHighresThumbnail?: boolean; // TODO: Remove when thumbnails have been fixed
  temp_published?: Date; // TODO: Remove when thumbnails have been fixed
};

export type PendingComic = {
  comicName: string;
  comicId: number;
  publishStatus: ComicPublishStatus;
  artistName: string;
  numberOfTags: number;
  timestamp: Date;
  errorText?: string;
  pendingProblemModId?: number;
  publishDate?: Date;
  publishingQueuePos?: number;
  uploadUserId?: number;
  uploadUserIP?: string;
  uploadUsername?: string;
  reviewerModId?: number;
  reviewerModName?: string;
  scheduleModId?: number;
  scheduleModName?: string;
};

export type ComicSuggestionVerdict = 'good' | 'bad';
export type ComicUploadVerdict =
  | 'excellent'
  | 'minor-issues'
  | 'major-issues'
  | 'page-issues'
  | 'terrible'
  | 'rejected'
  | 'rejected-list';

export type ComicMetadata = {
  timestamp: Date;
  errorText?: string;
  publishDate?: Date;
  modId?: number;
  modComment?: string;
  verdict?: ComicUploadVerdict;
  uploadUserId?: number;
  uploadUserIP?: string;
  uploadUsername?: string;
  originalNameIfRejected?: string;
  originalArtistIfRejected?: string;
  unlistComment?: string;
  pendingProblemModId?: number;
  source?: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type TagSuggestionItem = Tag & {
  isApproved: boolean | null;
  isAdding: boolean;
  tagSuggestionItemId: number;
};

export type JwtConfig = {
  tokenSecret: string;
  cookie: {
    name: string;
    domain: string;
    secure: boolean;
    maxAge: number;
    httpOnly: boolean;
  };
};

export type UserType = 'admin' | 'moderator' | 'normal';

export type UserSession = {
  userId: number;
  username: string;
  email: string | null;
  userType: UserType;
  patreonDollars?: number | null;
};

// Used for auth, where we don't need all the fields
export type SimpleUser = {
  id: number;
  username: string;
  email: string | null;
  userType: UserType;
  patreonDollars?: number | null;
};

export function isModOrAdmin({ userType }: { userType: UserType | undefined }) {
  return userType === 'admin' || userType === 'moderator';
}

export function isAdmin({ userType }: { userType: UserType | undefined }) {
  return userType === 'admin';
}

export type User = {
  id: number;
  username: string;
  email: string;
  userType: UserType;
  createdTime: Date;
  isBanned: boolean;
  banReason?: string;
  banTime?: Date;
  lastActionTime?: Date;
  modNotes?: string;
  hasCompletedConversion: boolean;
  patreonEmail?: string;
  patreonDollars?: number;
};

export type Patron = {
  userId: number;
  username: string;
  patreonDollars: number;
  patreonEmail: string;
};

export type ModApplication = {
  id: number;
  userId: number;
  timestamp: Date;
  telegramUsername: string;
  username: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'on-hold';
};

// It's not gorgeous, but it'll work. The numbers: counts of how many times
// this user has been given this type of verdict on their uploads.
// Counts instead of directly storing points as numbers will keep the points
// of the contributions changeable retroactively.
export type ContributionPointsEntry = {
  id: number;
  userId: number;
  username: string;
  userType: UserType;
  yearMonth: 'all-time' | string; // string will be YYYY-MM
  tagSuggestion: number;
  tagSuggestionRejected: number;
  comicProblem: number;
  comicProblemRejected: number;
  comicSuggestiongood: number;
  comicSuggestionbad: number;
  comicSuggestionRejected: number;
  comicUploadexcellent: number;
  comicUploadminorissues: number;
  comicUploadmajorissues: number;
  comicUploadpageissues: number;
  comicUploadterrible: number;
  comicUploadRejected: number;
};

export type FeedbackType = 'bug' | 'general' | 'support';

export type ContributionStatus = 'pending' | 'approved' | 'rejected' | 'processed';

export interface ContributionBase {
  comicName: string;
  status: ContributionStatus;
  timestamp: Date;
  points?: number;
  pointsDescription?: string;
  modComment?: string;
}

export interface ComicSuggestion extends ContributionBase {
  type: 'ComicSuggestion';
}

export interface ContributedComic extends ContributionBase {
  type: 'ContributedComic';
  artistName: string;
  numberOfPages: number;
  numberOfKeywords: number;
}

export type TagSuggestionContributionItem = {
  tagName: string;
  isApproved: boolean | null;
  isAdding: boolean;
};

export interface ContributionTagSuggestion extends ContributionBase {
  type: 'TagSuggestion';
  addTags: TagSuggestionContributionItem[];
  removeTags: TagSuggestionContributionItem[];
}

export interface ComicProblem extends ContributionBase {
  type: 'ComicProblem';
  problemCategory: string;
  description: string;
}

export type Contribution =
  | ComicSuggestion
  | ContributedComic
  | ContributionTagSuggestion
  | ComicProblem;

export type AdType = 'card' | 'banner' | 'topSmall';
export type AdStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'ENDED'
  | 'NEEDS CORRECTION'
  | 'AWAITING PAYMENT';
export const allAdStatuses: AdStatus[] = [
  'PENDING',
  'ACTIVE',
  'ENDED',
  'NEEDS CORRECTION',
  'AWAITING PAYMENT',
];

export type AdFreeTrialState = 'requested' | 'granted' | 'denied';
export enum AdFreeTrialStateEnum {
  Requested = 'requested',
  Granted = 'granted',
  Denied = 'denied',
}

export type AdvertisementInfo = {
  name: AdType;
  title: string;
  shortTitle: string;
  description: string;
  freeTrialOffered: boolean;
  hasTexts: boolean;
  minDimensions: {
    width: number;
    height: number;
  };
  alternativeDimensions?: {
    width: number;
    height: number;
  }[];
  idealDimensions?: {
    width: number;
    height: number;
  };
  pricesForMonths: {
    1: number;
    4: number;
    12: number;
  };
};

export type AdMediaType = 'image' | 'video' | 'gif';

// TODO-db: Make userId and clicks not nullable
export type Advertisement = {
  id: string;
  adType: AdType;
  adName: string;
  mediaType: AdMediaType;
  link: string;
  mainText?: string;
  secondaryText?: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  status: AdStatus;
  isAnimated: boolean;
  expiryDate?: Date;
  createdDate: Date;
  advertiserNotes?: string;
  clicks: number;
  impressions: number;
  impressionsSrv: number;
  clickRate: number;
  clickRateSrv: number;
  clicksPerDayActive: number;
  adminNotes?: string;
  correctionNote?: string;
  freeTrialState?: 'requested' | 'granted' | 'denied';
  lastActivationDate?: Date;
  currentDaysActive: number;
  numDaysActive: number;
  isChangedWhileActive: boolean;
  videoSpecificFileType?: string | null;
  isFromOldSystem: boolean;
};

export type AdvertisementPoorlyTyped = Omit<
  Advertisement,
  'createdDate' | 'expiryDate' | 'lastActivationDate'
> & {
  createdDate: string;
  expiryDate?: string;
  lastActivationDate?: string;
};

export function advertisementTypeMapper(ad: AdvertisementPoorlyTyped): Advertisement {
  return {
    ...ad,
    createdDate: new Date(ad.createdDate),
    expiryDate: ad.expiryDate ? new Date(ad.expiryDate) : undefined,
    lastActivationDate: ad.lastActivationDate
      ? new Date(ad.lastActivationDate)
      : undefined,
  };
}

export type AdvertisementFullData = {
  ad: Advertisement;
  payments: { amount: number; registeredDate: Date }[];
  clicks: { date: Date; clicks: number }[];
};

export type AdForViewing = {
  id: string;
  link: string;
  adType: AdType;
  mainText?: string;
  secondaryText?: string;
  isAnimated: boolean;
  renderId?: string;
  mediaType: AdMediaType;
  videoSpecificFileType?: string | null;
};

export type Blog = {
  id: number;
  title: string;
  content: string;
  authorUser: {
    id: number;
    username: string;
  };
  timestamp: Date;
};

export type SortType = 'Updated' | 'User score' | 'Your score' | 'Random';
export const allSortTypes: SortType[] = ['Updated', 'User score', 'Your score', 'Random'];

export type PageDisplay = 'Fit' | 'Fit height' | 'Fit width' | 'Full size' | 'Tiny';

export type SearchFilterState = {
  isAllCategories: boolean;
  categories: Category[];
  searchString: string;
  tags: Tag[];
  sort: SortType;
};

export type ComicDisplayOptions = {
  display: PageDisplay;
  reverseOrder: boolean;
  clickToToggleDisplay: boolean;
};

export type UIPreferences = {
  theme: 'light' | 'dark';
  comicCardTags: boolean;
  comicDisplayOptions: ComicDisplayOptions;
};

export type AdPaymentMethod = 'now' | 'free-trial';

// Ratings from the old site, from 1-10. Let users convert.
export type OldComicRating = {
  comicId: number;
  userId: number;
  rating: number;
};

export type SpammableAction = {
  ip: string;
  actionType: string;
  email?: string;
  username?: string;
};

export type ModPanelMessage = {
  id: number;
  title: string;
  isRead: boolean;
  message: string;
  timestamp: Date;
};

export type ModActionType =
  | 'upload-processed'
  | 'suggestion-processed'
  | 'tagsuggestion-processed'
  | 'problem-processed'
  | 'comic-uploaded'
  | 'comic-data-updated'
  | 'comic-tags-updated'
  | 'comic-thumbnail-changed'
  | 'comic-pages-changed'
  | 'artist-updated'
  | 'tag-updated'
  | 'pending-published';

export type ModAction = {
  id: number;
  user: {
    id: number;
    username: string;
  };
  comic?: {
    id: number;
    name: string;
  };
  artist?: {
    id: number;
    name: string;
  };
  dashboardActionId?: number;
  actionType: ModActionType;
  text?: string;
  points: number;
  timestamp: Date;
};
