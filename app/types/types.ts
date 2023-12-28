// This is a combination of env variables found in .dev.vars and the
// other bindings such as R2, D1 sql, created locally through runtime
// arguments (see package.json, --r2=<BUCKET> etc).
export interface Env {
  URL_BASE_OLD_DO_NOT_USE: string;
  DB_API_URL_BASE: string;
  FRONT_PAGE_URL: string;
  JWT_CONFIG_STR: string;
  POSTMARK_TOKEN: string;
  DAILY_SCHEDULE_PUBLISH_COUNT: string;
  SENTRY_DSN: string;
  SENTRY_AUTH_TOKEN: string;
  PAGES_PATH: string;

  COMICS_BUCKET: R2Bucket;
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

export type Comic = {
  name: string;
  id: number;
  state: 'wip' | 'cancelled' | 'finished';
  publishStatus: ComicPublishStatus;
  classification: 'Furry' | 'Pokemon' | 'MLP' | 'Other';
  category: 'M' | 'F' | 'MF' | 'MM' | 'FF' | 'MF+' | 'I';
  numberOfPages: number;
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

// Will definitely be expanded when we get more stuff in here
export type User = {
  id: number;
  username: string;
  email: string;
  userType: 'admin' | 'moderator' | 'user';
};

export type ModApplication = {
  id: number;
  userId: number;
  timestamp: string;
  telegramUsername: string;
  username: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'on hold';
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
