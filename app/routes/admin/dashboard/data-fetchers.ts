import { CONTRIBUTION_POINTS } from '~/types/contributions';
import {
  ComicPublishStatus,
  ComicSuggestionVerdict,
  ComicUploadVerdict,
} from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';
import { DashboardAction } from '.';

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

export async function getTagSuggestions(urlBase: string): Promise<DashboardAction[]> {
  const query = `SELECT Q1.*, user.username AS modName 
      FROM (
        SELECT
            keywordsuggestion.id AS id,
            keywordsuggestion.keywordId AS keywordId,
            keyword.KeywordName AS keywordName,
            comic.Name AS comicName,
            keywordsuggestion.comicId AS comicId,
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

  const result = await queryDbDirect<DbTagSuggestion[]>(urlBase, query);

  const mappedResults: DashboardAction[] = result.map(dbTagSugg => {
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

  return mappedResults;
}

type DbComicProblem = {
  id: number;
  categoryName: string;
  description: string;
  comicName: string;
  status: string;
  timestamp: string;
  userId?: number;
  userIP?: string;
  username?: string;
  modId?: number;
  modName?: string;
};

export async function getProblems(urlBase: string): Promise<DashboardAction[]> {
  const query = `SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comicproblem.id AS id,
          comicproblemcategory.Name AS categoryName,
          description,
          comic.name AS comicName,
          comicproblem.status,
          comicproblem.timestamp,
          userId,
          userIP,
          user.username AS username,
          assignedModId AS modId
        FROM comicproblem
        INNER JOIN comicproblemcategory ON (comicproblemcategory.id = comicproblem.problemCategoryId)
        INNER JOIN comic ON (comic.id = comicproblem.comicId)
        LEFT JOIN user ON (user.id = comicproblem.userId)
      ) AS Q1
    LEFT JOIN user ON (Q1.modId = user.id)
  `;

  const result = await queryDbDirect<DbComicProblem[]>(urlBase, query);

  const mappedResults: DashboardAction[] = result.map(dbComicProblem => {
    return {
      type: 'comicProblem',
      id: dbComicProblem.id,
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

  return mappedResults;
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

export async function getComicSuggestions(urlBase: string): Promise<DashboardAction[]> {
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

  const result = await queryDbDirect<DbComicSuggestion[]>(urlBase, query);

  const mappedResults: DashboardAction[] = result.map(dbComicSugg => {
    let verdictText = undefined;
    if (dbComicSugg.status === 'approved' || dbComicSugg.status === 'rejected') {
      verdictText = dbComicSugg.status === 'approved' ? 'Approved' : 'Rejected';
    }
    if (dbComicSugg.verdict === 'bad') {
      verdictText += ' - bad info';
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

  return mappedResults;
}

type DbComicUpload = {
  id: number;
  comicName: string;
  artistName: string;
  publishStatus: ComicPublishStatus;
  verdict?: ComicUploadVerdict;
  timestamp: string;
  uploadUserId?: number;
  uploadUserIP?: string;
  uploadUsername?: string;
  modId?: number;
  modName?: string;
  modComment?: string;
};

export async function getComicUploads(urlBase: string): Promise<DashboardAction[]> {
  const query = `
      SELECT Q1.*, user.username AS modName
      FROM (
        SELECT
          comic.id,
          comic.name AS comicName,
          artist.name AS artistName,
          publishStatus,
          verdict,
          timestamp,
          comicmetadata.uploadUserId,
          comicmetadata.uploadUserIP,
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

  const result = await queryDbDirect<DbComicUpload[]>(urlBase, query);

  const mappedResults: DashboardAction[] = result.map(dbComicUpload => {
    let fullVerdictText = '';
    const isProcessed = dbComicUpload.publishStatus !== 'uploaded';

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

    return {
      type: 'comicUpload',
      id: dbComicUpload.id,
      primaryField: `${dbComicUpload.comicName} - ${dbComicUpload.artistName}`,
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

  return mappedResults;
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

export async function pendingComicProblem(urlBase: string): Promise<DashboardAction[]> {
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

  const result = await queryDbDirect<DbPendingComicSimple[]>(urlBase, query);

  const mappedResults: DashboardAction[] = result.map(dbPending => {
    return {
      type: 'pendingComicProblem',
      id: dbPending.comicId,
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

  return mappedResults;
}
