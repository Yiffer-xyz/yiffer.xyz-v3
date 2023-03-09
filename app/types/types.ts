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
  };
  tags: Tag[];
  unpublishedData?: UnpublishedComicData;
};

export type ComicPublishStatus =
  | 'published'
  | 'pending'
  | 'uploaded'
  | 'rejected'
  | 'rejected-list';

export type ComicTiny = {
  id: number;
  name: string;
  publishStatus: ComicPublishStatus;
};

export type ComicSuggestionVerdict = 'good' | 'bad';
export type ComicUploadVerdict =
  | 'excellent'
  | 'minor-issues'
  | 'major-issues'
  | 'page-issues'
  | 'rejected';

export type UnpublishedComicData = {
  timestamp: string;
  errorText?: string;
  publishDate?: string;
  modId?: number;
  modComment?: string;
  verdict?: ComicUploadVerdict;
  uploadUserId?: number;
  uploadUserIP?: string;
  uploadUsername?: string;
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
