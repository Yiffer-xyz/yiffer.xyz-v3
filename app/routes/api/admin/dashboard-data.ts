import { LoaderArgs } from '@remix-run/cloudflare';
import { redirectIfNotMod } from '~/utils/loaders';

type UserOrIP = {
  username?: string;
  userId?: number;
  ip?: string;
};

type UsernameAndUserId = {
  username: string;
  userId: number;
};

export type DashboardActionType =
  | 'tagSuggestion'
  | 'comicProblem'
  | 'comicSuggestion'
  | 'comicUpload'
  | 'pendingComicProblem';

export type DashboardAction = {
  type: DashboardActionType;
  id: number;
  comicId?: number;
  primaryField: string;
  secondaryField?: string;
  description?: string;
  isProcessed: boolean;
  timestamp: string;
  assignedMod?: UsernameAndUserId;
  user: UserOrIP;
  verdict?: string; // the result of the mod processing (eg. "approved", "rejected - comment 'asdasd'")
};

export async function loader(args: LoaderArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;

  const dataResponses: { err?: ApiError; data?: DashboardAction[] }[] = await Promise.all(
    [
      getTagSuggestions(urlBase),
      getProblems(urlBase),
      getComicUploads(urlBase),
      getComicSuggestions(urlBase),
      getPendingComicProblems(urlBase),
    ]
  );

  const allSuggestions: DashboardAction[] = [];
  for (const response of dataResponses) {
    if (response.err) {
      return processApiError('Error fetching admin dashboard data', response.err);
    }
    if (response.data) {
      allSuggestions.push(...response.data);
    }
  }

  allSuggestions.sort((a, b) => {
    return a.timestamp.localeCompare(b.timestamp, undefined, {}) * -1;
  });

  return createSuccessJson(allSuggestions);
}

import { CONTRIBUTION_POINTS } from '~/types/contributions';
import {
  ComicPublishStatus,
  ComicSuggestionVerdict,
  ComicUploadVerdict,
} from '~/types/types';
import { queryDb, queryDbDirect } from '~/utils/database-facade';
import {
  ApiError,
  create500Json,
  createSuccessJson,
  dbErrObj,
  logErrorOLD_DONOTUSE,
  processApiError,
} from '~/utils/request-helpers';

type DbTagSuggestion = {
  id: number;
  keywordId: number;
  keywordName: string;
  comicName: string;
  comicId: number;
  isAdding: number;
  status: string;
  timestamp: string;
  userId?: number;
  username?: string;
  userIP?: string;
  modId?: number;
  modName?: string;
};

async function getTagSuggestions(urlBase: string): Promise<{
  data?: DashboardAction[];
  err?: ApiError;
}> {
  const query = `SELECT Q1.*, user.username AS modName 
      FROM (
        SELECT
            keywordsuggestion.id AS id,
            keywordsuggestion.keywordId AS keywordId,
            keyword.KeywordName AS keywordName,
            comic.name AS comicName,
            comic.id AS comicId,
            isAdding,
            status,
            keywordsuggestion.timestamp,
            userId,
            username,
            userIP,
            modId
          FROM keywordsuggestion
          INNER JOIN comic ON (comic.id = keywordsuggestion.comicId)
          INNER JOIN keyword ON (keyword.Id = keywordsuggestion.keywordId)
          LEFT JOIN user ON (user.id = keywordsuggestion.userId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `;

  const dbRes = await queryDb<DbTagSuggestion[]>(urlBase, query);
  if (dbRes.errorMessage) {
    return dbErrObj(dbRes, 'Error getting tag suggestions');
  }

  const mappedResults: DashboardAction[] = dbRes.result!.map(dbTagSugg => {
    return {
      type: 'tagSuggestion',
      id: dbTagSugg.id,
      primaryField: dbTagSugg.comicName,
      secondaryField: `${dbTagSugg.isAdding === 1 ? 'ADD' : 'REMOVE'} ${
        dbTagSugg.keywordName
      }`,
      isProcessed: dbTagSugg.status !== 'pending',
      timestamp: dbTagSugg.timestamp,
      user: dbTagSugg.userId
        ? { userId: dbTagSugg.userId, username: dbTagSugg.username }
        : { ip: dbTagSugg.userIP },
      verdict:
        dbTagSugg.status === 'approved'
          ? 'Approved'
          : dbTagSugg.status === 'rejected'
          ? 'Rejected'
          : undefined,
      assignedMod:
        dbTagSugg.modId && dbTagSugg.modName
          ? { userId: dbTagSugg.modId, username: dbTagSugg.modName }
          : undefined,
      isAdding: dbTagSugg.isAdding === 1,
      tagId: dbTagSugg.keywordId,
      comicId: dbTagSugg.comicId,
    };
  });

  return {
    data: mappedResults,
  };
}

type DbComicProblem = {
  id: number;
  categoryName: string;
  description: string;
  comicName: string;
  comicId: number;
  status: string;
  timestamp: string;
  userId?: number;
  userIP?: string;
  username?: string;
  modId?: number;
  modName?: string;
};

async function getProblems(urlBase: string): Promise<{
  data?: DashboardAction[];
  err?: ApiError;
}> {
  const query = `SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comicproblem.id AS id,
          comicproblemcategory.Name AS categoryName,
          description,
          comic.name AS comicName,
          comic.id AS comicId,
          comicproblem.status,
          comicproblem.timestamp,
          userId,
          userIP,
          user.username AS username,
          modId
        FROM comicproblem
        INNER JOIN comicproblemcategory ON (comicproblemcategory.id = comicproblem.problemCategoryId)
        INNER JOIN comic ON (comic.id = comicproblem.comicId)
        LEFT JOIN user ON (user.id = comicproblem.userId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `;

  const dbRes = await queryDb<DbComicProblem[]>(urlBase, query);

  if (dbRes.errorMessage) {
    return dbErrObj(dbRes, 'Error getting comic problems');
  }

  const mappedResults: DashboardAction[] = dbRes.result!.map(dbComicProblem => {
    return {
      type: 'comicProblem',
      id: dbComicProblem.id,
      comicId: dbComicProblem.comicId,
      primaryField: dbComicProblem.comicName,
      secondaryField: dbComicProblem.categoryName,
      description: dbComicProblem.description,
      isProcessed: dbComicProblem.status !== 'pending',
      timestamp: dbComicProblem.timestamp,
      user: dbComicProblem.userId
        ? { userId: dbComicProblem.userId, username: dbComicProblem.username }
        : { ip: dbComicProblem.userIP },
      verdict:
        dbComicProblem.status === 'approved'
          ? 'Approved'
          : dbComicProblem.status === 'rejected'
          ? 'Rejected'
          : undefined,
      assignedMod:
        dbComicProblem.modId && dbComicProblem.modName
          ? { userId: dbComicProblem.modId, username: dbComicProblem.modName }
          : undefined,
    };
  });

  return {
    data: mappedResults,
  };
}

type DbComicSuggestion = {
  id: number;
  comicName: string;
  description: string;
  artistName: string;
  status: string;
  timestamp: string;
  userId?: number;
  userIP?: string;
  username?: string;
  modId?: number;
  modName?: string;
  modComment?: string;
  verdict?: ComicSuggestionVerdict;
};

async function getComicSuggestions(urlBase: string): Promise<{
  data?: DashboardAction[];
  err?: ApiError;
}> {
  const query = `SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comicsuggestion.id AS id,
          comicsuggestion.name AS comicName,
          description AS description,
          artistName AS artistName,
          comicsuggestion.status AS status,
          comicsuggestion.timestamp AS timestamp,
          verdict,
          userId,
          userIP,
          user.username AS username,
          modId AS modId,
          modComment
        FROM comicsuggestion
        LEFT JOIN user ON (user.id = comicsuggestion.userId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `;

  const dbRes = await queryDb<DbComicSuggestion[]>(urlBase, query);

  if (dbRes.errorMessage) {
    return dbErrObj(dbRes, 'Error getting comic suggestions');
  }

  const mappedResults: DashboardAction[] = dbRes.result!.map(dbComicSugg => {
    let verdictText = undefined;
    if (dbComicSugg.status === 'approved' || dbComicSugg.status === 'rejected') {
      verdictText = dbComicSugg.status === 'approved' ? 'Approved' : 'Rejected';
    }
    if (dbComicSugg.verdict === 'bad') {
      verdictText += ' - bad info';
    }
    if (dbComicSugg.verdict === 'good') {
      verdictText += ' - excellent info';
    }
    if (dbComicSugg.modComment) {
      verdictText += ` - mod comment: ${dbComicSugg.modComment}`;
    }

    return {
      type: 'comicSuggestion',
      id: dbComicSugg.id,
      primaryField: `${dbComicSugg.comicName} - ${dbComicSugg.artistName}`,
      description: dbComicSugg.description,
      isProcessed: dbComicSugg.status !== 'pending',
      timestamp: dbComicSugg.timestamp,
      user: dbComicSugg.userId
        ? { userId: dbComicSugg.userId, username: dbComicSugg.username }
        : { ip: dbComicSugg.userIP },
      verdict: verdictText,
      assignedMod:
        dbComicSugg.modId && dbComicSugg.modName
          ? { userId: dbComicSugg.modId, username: dbComicSugg.modName }
          : undefined,
    };
  });

  return {
    data: mappedResults,
  };
}

type DbComicUpload = {
  id: number;
  comicName: string;
  comicId: number;
  artistName: string;
  publishStatus: ComicPublishStatus;
  verdict?: ComicUploadVerdict;
  timestamp: string;
  uploadUserId?: number;
  uploadUserIP?: string;
  originalNameIfRejected?: string;
  uploadUsername?: string;
  modId?: number;
  modName?: string;
  modComment?: string;
};

async function getComicUploads(urlBase: string): Promise<{
  data?: DashboardAction[];
  err?: ApiError;
}> {
  const query = `
      SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comic.id,
          comic.name AS comicName,
          comic.id AS comicId,
          artist.name AS artistName,
          publishStatus,
          verdict,
          timestamp,
          comicmetadata.uploadUserId,
          comicmetadata.uploadUserIP,
          comicmetadata.originalNameIfRejected,
          user.username AS uploadUsername,
          modId,
          modComment
        FROM comic
        INNER JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
        INNER JOIN artist ON (artist.id = comic.artist)
        LEFT JOIN user ON (user.id = comicmetadata.uploadUserId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `;

  const dbRes = await queryDb<DbComicUpload[]>(urlBase, query);

  if (dbRes.errorMessage) {
    return dbErrObj(dbRes, 'Error getting comic uploads');
  }

  // If a mod uploads, it skips the verification and goes straight to pending
  // In these cases, don't show in the dashboard. This is the only case where it
  // will be not uploaded but lack a modId.
  const notModUploads = dbRes.result!.filter(
    dbComicUpload => !(dbComicUpload.publishStatus !== 'uploaded' && !dbComicUpload.modId)
  );

  const mappedResults: DashboardAction[] = notModUploads.map(dbComicUpload => {
    let fullVerdictText = '';
    const isProcessed = dbComicUpload.publishStatus !== 'uploaded';

    if (isProcessed && !dbComicUpload.uploadUserId) {
      if (dbComicUpload.publishStatus === 'pending') {
        fullVerdictText = 'Approved, set to pending';
      }
      if (dbComicUpload.publishStatus === 'rejected') {
        fullVerdictText = 'Rejected';
      }
      if (dbComicUpload.publishStatus === 'rejected-list') {
        fullVerdictText = 'Rejected, added to ban list';
      }
    }
    if (isProcessed && dbComicUpload.verdict) {
      const verdictText =
        CONTRIBUTION_POINTS.comicUpload[dbComicUpload.verdict].actionDashboardDescription;
      const isRejected =
        dbComicUpload.verdict === 'rejected' || dbComicUpload.verdict === 'rejected-list';

      fullVerdictText = isRejected ? 'Rejected' : 'Approved';
      if (verdictText) {
        fullVerdictText += ` - ${verdictText}`;
      }
      if (dbComicUpload.modComment) {
        fullVerdictText += ` - mod comment: ${dbComicUpload.modComment}`;
      }
    }

    let comicName = dbComicUpload.comicName;
    if (dbComicUpload.publishStatus === 'rejected') {
      comicName = dbComicUpload.originalNameIfRejected || comicName;
    }

    return {
      type: 'comicUpload',
      id: dbComicUpload.id,
      comicId: dbComicUpload.comicId,
      primaryField: `${comicName} - ${dbComicUpload.artistName}`,
      isProcessed: dbComicUpload.publishStatus !== 'uploaded',
      timestamp: dbComicUpload.timestamp,
      user: dbComicUpload.uploadUsername
        ? { userId: dbComicUpload.uploadUserId, username: dbComicUpload.uploadUsername }
        : { ip: dbComicUpload.uploadUserIP },
      verdict: isProcessed ? fullVerdictText : undefined,
      assignedMod:
        dbComicUpload.modId && dbComicUpload.modName
          ? { userId: dbComicUpload.modId, username: dbComicUpload.modName }
          : undefined,
    };
  });

  return {
    data: mappedResults,
  };
}

type DbPendingComicSimple = {
  comicName: string;
  comicId: number;
  artistName: string;
  pendingProblemModId?: number;
  pendingProblemModName?: string;
  uploadUserId?: number;
  uploadUserIP?: string;
  uploadUsername?: string;
  timestamp: string;
  errorText?: string;
};

export async function getPendingComicProblems(urlBase: string): Promise<{
  data?: DashboardAction[];
  err?: ApiError;
}> {
  const query = `
    SELECT Q1.*, user.username AS pendingProblemModName
    FROM (
      SELECT
        comic.name AS comicName,
        comic.id AS comicId,
        artist.name AS artistName,
        comicmetadata.uploadUserId,
        comicmetadata.uploadUserIP,
        user.username AS uploadUsername,
        pendingProblemModId,
        timestamp,
        errorText
      FROM comic
      INNER JOIN artist ON (artist.id = comic.artist)
      INNER JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
      LEFT JOIN user ON (user.id = comicmetadata.uploadUserId)
      WHERE publishStatus = 'pending'
      AND errorText IS NOT NULL
    ) AS Q1
    LEFT JOIN user ON (Q1.pendingProblemModId = user.id)
  `;

  const dbRes = await queryDb<DbPendingComicSimple[]>(urlBase, query);

  if (dbRes.errorMessage) {
    return dbErrObj(dbRes, 'Error getting pending comics');
  }

  const mappedResults: DashboardAction[] = dbRes.result!.map(dbPending => {
    return {
      type: 'pendingComicProblem',
      id: dbPending.comicId,
      comicId: dbPending.comicId,
      primaryField: `${dbPending.comicName} - ${dbPending.artistName}`,
      isProcessed: false,
      timestamp: dbPending.timestamp,
      user:
        dbPending.uploadUserId && dbPending.uploadUsername
          ? {
              userId: dbPending.uploadUserId,
              username: dbPending.uploadUsername,
            }
          : { ip: dbPending.uploadUserIP },
      verdict: undefined,
      assignedMod:
        dbPending.pendingProblemModId && dbPending.pendingProblemModName
          ? {
              userId: dbPending.pendingProblemModId,
              username: dbPending.pendingProblemModName,
            }
          : undefined,
    };
  });

  return {
    data: mappedResults,
  };
}
