// This is a combination of env variables found in .dev.vars and the
// other bindings such as R2, D1 sql, created locally through runtime
// arguments (see package.json, --r2=<BUCKET> etc).
export interface Env {
  FRONT_END_URL_BASE: string;
  FRONT_PAGE_URL: string;
  IMAGES_SERVER_URL: string;
  PAGES_PATH: string;
  ADS_PATH: string;
  JWT_CONFIG_STR: string;
  POSTMARK_TOKEN: string;
  DAILY_SCHEDULE_PUBLISH_COUNT: string;
  SENTRY_DSN: string;
  SENTRY_AUTH_TOKEN: string;
  DB: D1Database;
}

export enum UserType {
  Admin = 'admin',
  Mod = 'moderator',
  User = 'user',
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
  published?: string;
  updated?: string;
  metadata?: ComicMetadata;
};

export type ComicForBrowse = {
  id: number;
  name: string;
  category: Category;
  artistName: string;
  updated: string;
  published: string;
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
  temp_published?: string; // TODO: Remove when thumbnails have been fixed
};

export type DbPendingComic = {
  comicName: string;
  comicId: number;
  publishStatus: ComicPublishStatus;
  artistName: string;
  numberOfTags: number;
  timestamp: string;
  errorText?: string;
  pendingProblemModId?: number;
  publishDate?: string;
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
  timestamp: string;
  errorText?: string;
  publishDate?: string;
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

export type UserSession = {
  userId: number;
  username: string;
  userType: 'admin' | 'moderator' | 'user';
};

// Used for auth, where we don't need all the fields
export type SimpleUser = {
  id: number;
  username: string;
  email: string;
  userType: 'admin' | 'moderator' | 'user';
};

export type User = {
  id: number;
  username: string;
  email: string;
  userType: 'admin' | 'moderator' | 'user';
  createdTime: string;
  isBanned: boolean;
  banReason?: string;
  modNotes?: string;
};

export type ModApplication = {
  id: number;
  userId: number;
  timestamp: string;
  telegramUsername: string;
  username: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
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
  timestamp: string;
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

export type AdFreeTrialState = 'requested' | 'granted' | 'denied';
export enum AdFreeTrialStateEnum {
  Requested = 'requested',
  Granted = 'granted',
  Denied = 'denied',
}

export type AdvertisementInfo = {
  name: AdType;
  title: string;
  description: string;
  freeTrialOffered: boolean;
  hasTexts: boolean;
  minDimensions: {
    width: number;
    height: number;
  };
  idealDimensions?: {
    width: number;
    height: number;
  };
  pricesForMonts: {
    1: number;
    4: number;
    12: number;
  };
};

// TODO-db: Make userId and clicks not nullable
export type Advertisement = {
  id: string;
  adType: AdType;
  adName: string;
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
  expiryDate?: string;
  createdDate: string;
  advertiserNotes?: string;
  clicks: number;
  adminNotes?: string;
  correctionNote?: string;
  freeTrialState?: 'requested' | 'granted' | 'denied';
  lastActivationDate?: string;
  numDaysActive: number;
};

export type CardAdForViewing = {
  id: string;
  link: string;
  mainText: string;
  secondaryText?: string;
  isAnimated: boolean;
  renderId?: string;
};

export type Blog = {
  id: number;
  title: string;
  content: string;
  authorUser: {
    id: number;
    username: string;
  };
  timestamp: string;
};

export type SortType = 'Updated' | 'User score' | 'Your score' | 'Random';
export const allSortTypes: SortType[] = ['Updated', 'User score', 'Your score', 'Random'];

export type ViewType = 'Minimal' | 'Standard';
export const allViewTypes: ViewType[] = ['Minimal', 'Standard'];
export function isViewType(viewType: string): viewType is ViewType {
  return allViewTypes.includes(viewType as ViewType);
}

export type SearchFilterState = {
  isAllCategories: boolean;
  categories: Category[];
  searchString: string;
  tags: Tag[];
  sort: SortType;
  viewType: ViewType;
};

export type UIPreferences = {
  theme: 'light' | 'dark';
  viewMode: ViewType;
  comicCardTags: boolean;
};

export type AdPaymentMethod = 'now' | 'free-trial';
