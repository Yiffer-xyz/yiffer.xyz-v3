export enum UserType {
  Admin = 'admin',
  Mod = 'mod',
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
  state: 'WIP' | 'Cancelled' | 'Finished';
  classification: 'Furry' | 'Pokemon' | 'MLP' | 'Other';
  category: 'M' | 'F' | 'MF' | 'MM' | 'FF' | 'MF+' | 'I';
  previousComic?: Comic;
  nextComic?: Comic;
  isPending?: boolean;
};

export type UploadedComic = {
  id: number;
  name: string;
  artistId?: number;
  classification: 'Furry' | 'Pokemon' | 'MLP' | 'Other';
  category: 'M' | 'F' | 'MF' | 'MM' | 'FF' | 'MF+' | 'I';
  state: 'WIP' | 'Cancelled' | 'Finished';
  numberOfPages: number;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'rejected-list';
  points?: number;
  pointsDescription?: string;
  modComment?: string;
  userId?: number;
  userIP?: string;
  uploadId: string; // TODO: what is this
  newArtistName?: string;
  newArtistPatreonName?: string;
  newArtistE621Name?: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type Tag = {
  id: number;
  name: string;
};

export interface JwtConfig {
  tokenSecret: string;
  cookie: {
    name: string;
    domain: string;
    secure: boolean;
    maxAge: number;
    httpOnly: boolean;
  };
}

export interface UserSession {
  userId: number;
  username: string;
}

// Will definitely be expanded when we get more stuff in here
export interface User {
  id: number;
  username: string;
  email: string;
  userType: 'admin' | 'moderator' | 'user';
}
