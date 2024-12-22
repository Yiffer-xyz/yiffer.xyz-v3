import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import type {
  ComicPublishStatus,
  ComicSuggestionVerdict,
  ComicUploadVerdict,
  TagSuggestionItem,
} from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';

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
  timestamp: Date;
  assignedMod?: UsernameAndUserId;
  user: UserOrIP;
  verdict?: string; // the result of the mod processing (eg. "approved", "rejected - comment 'asdasd'")
};

const tagSuggestionsQuery = `SELECT Q1.*, user.username AS modName
  FROM (
    SELECT 
      tagsuggestiongroup.id AS tagSuggestionGroupId,
      tagsuggestionitem.isAdding AS isAdding,
      tagsuggestionitem.keywordId AS keywordId,
      tagsuggestionitem.isApproved AS isItemApproved,
      tagsuggestionitem.id AS tagSuggestionItemId,
      keyword.keywordName AS keywordName,
      comic.id AS comicId,
      comic.name AS comicName,
      isProcessed,
      tagsuggestiongroup.timestamp,
      isProcessed,
      userId,
      username,
      userIP,
      modId
    FROM tagsuggestiongroup
    LEFT JOIN tagsuggestionitem ON (tagsuggestiongroup.id = tagsuggestionitem.tagSuggestionGroupId)
    INNER JOIN keyword ON (keyword.id = tagsuggestionitem.keywordId)
    INNER JOIN comic ON (comic.id = tagsuggestiongroup.comicId)
    LEFT JOIN user ON (user.id = tagsuggestiongroup.userId)
  ) AS Q1
  LEFT JOIN user ON (Q1.modId = user.id)
;`;

const comicProblemsQuery = `SELECT Q1.*, user.username AS modName
  FROM (
    SELECT
      comicproblem.id AS id,
      problemCategory,
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
    INNER JOIN comic ON (comic.id = comicproblem.comicId)
    LEFT JOIN user ON (user.id = comicproblem.userId)
  ) AS Q1
  LEFT JOIN user ON (Q1.modId = user.id)
`;

const comicSuggestionsQuery = `SELECT Q1.*, user.username AS modName
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

const comicUploadsQuery = `SELECT Q1.*, user.username AS modName
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

const pendingComicsSimpleQuery = `SELECT Q1.*, user.username AS pendingProblemModName
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

export async function loader(args: LoaderFunctionArgs) {
  const dataFetchStatements: QueryWithParams[] = [
    { query: tagSuggestionsQuery, queryName: 'Tag suggestions, admin' },
    { query: comicProblemsQuery, queryName: 'Comic problems, admin' },
    { query: comicUploadsQuery, queryName: 'Comic uploads, admin' },
    { query: comicSuggestionsQuery, queryName: 'Comic suggestions, admin' },
    { query: pendingComicsSimpleQuery, queryName: 'Pending comics, admin' },
  ];

  const dbResList = await queryDbMultiple<
    [
      DbFullTagSuggestion[],
      DbComicProblem[],
      DbComicUpload[],
      DbComicSuggestion[],
      DbPendingComicSimple[],
    ]
  >(args.context.cloudflare.env.DB, dataFetchStatements);

  if (dbResList.isError) {
    return processApiError(
      'Error in /api/admin/dashboard-data loader',
      makeDbErr(dbResList, 'Error getting dashboard data')
    );
  }

  const allSuggestions: DashboardAction[] = [
    ...mapDbTagSuggestions(dbResList.result[0]),
    ...mapDbComicProblems(dbResList.result[1]),
    ...mapDbComicUploads(dbResList.result[2]),
    ...mapDbComicSuggestions(dbResList.result[3]),
    ...mapDbPendingComicProblems(dbResList.result[4]),
  ];

  allSuggestions.sort((a, b) => {
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return createSuccessJson(allSuggestions);
}

type DbFullTagSuggestion = {
  tagSuggestionGroupId: number;
  tagSuggestionItemId: number;
  isAdding: number;
  keywordId: number;
  keywordName: string;
  comicId: number;
  comicName: string;
  isProcessed: number;
  isItemApproved: number | null;
  timestamp: string;
  userId?: number;
  userIP?: string;
  username?: string;
  modId?: number;
  modName?: string;
};

type TagSuggestionGroup = {
  id: number;
  comicId: number;
  comicName: string;
  timestamp: Date;
  userId: number | undefined;
  userIP: string | undefined;
  username: string | undefined;
  modId: number | undefined;
  modName: string | undefined;
  isProcessed: boolean;
  addTags: TagSuggestionItem[];
  removeTags: TagSuggestionItem[];
};

function tinyIntOrNullToBool(input: number | null): boolean | null {
  if (input === null) {
    return null;
  }
  return input === 1;
}

function mapDbTagSuggestions(input: DbFullTagSuggestion[]): DashboardAction[] {
  // Group tag suggestions by tagSuggestionGroupId
  const groupedSuggestions: Map<number, TagSuggestionGroup> = new Map();

  for (const dbTagSugg of input) {
    let group = groupedSuggestions.get(dbTagSugg.tagSuggestionGroupId);
    if (!group) {
      group = {
        id: dbTagSugg.tagSuggestionGroupId,
        comicId: dbTagSugg.comicId,
        comicName: dbTagSugg.comicName,
        timestamp: parseDbDateStr(dbTagSugg.timestamp),
        userId: dbTagSugg.userId,
        userIP: dbTagSugg.userIP,
        username: dbTagSugg.username,
        modId: dbTagSugg.modId,
        modName: dbTagSugg.modName,
        isProcessed: dbTagSugg.isProcessed === 1,
        addTags: [],
        removeTags: [],
      };
      groupedSuggestions.set(dbTagSugg.tagSuggestionGroupId, group);
    }

    const item: TagSuggestionItem = {
      id: dbTagSugg.keywordId,
      name: dbTagSugg.keywordName,
      isApproved: tinyIntOrNullToBool(dbTagSugg.isItemApproved),
      tagSuggestionItemId: dbTagSugg.tagSuggestionItemId,
      isAdding: dbTagSugg.isAdding === 1,
    };

    if (dbTagSugg.isAdding === 1) {
      group.addTags.push(item);
    } else {
      group.removeTags.push(item);
    }
  }

  return Array.from(groupedSuggestions.values()).map(group => {
    return {
      type: 'tagSuggestion',
      id: group.id,
      comicId: group.comicId,
      primaryField: group.comicName,
      description: getTagSuggestionGroupDescription(group),
      isProcessed: group.isProcessed,
      timestamp: group.timestamp,
      user: group.userId
        ? { userId: group.userId, username: group.username }
        : { ip: group.userIP },
      assignedMod:
        group.modId && group.modName
          ? { userId: group.modId, username: group.modName }
          : undefined,
      addTags: group.addTags,
      removeTags: group.removeTags,
    };
  });
}

type DbComicProblem = {
  id: number;
  problemCategory: string;
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

function mapDbComicProblems(input: DbComicProblem[]): DashboardAction[] {
  return input.map(dbComicProblem => {
    return {
      type: 'comicProblem',
      id: dbComicProblem.id,
      comicId: dbComicProblem.comicId,
      primaryField: dbComicProblem.comicName,
      secondaryField: dbComicProblem.problemCategory,
      description: dbComicProblem.description,
      isProcessed: dbComicProblem.status !== 'pending',
      timestamp: parseDbDateStr(dbComicProblem.timestamp),
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

function mapDbComicSuggestions(input: DbComicSuggestion[]): DashboardAction[] {
  return input.map(dbComicSugg => {
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
      timestamp: parseDbDateStr(dbComicSugg.timestamp),
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

function mapDbComicUploads(input: DbComicUpload[]): DashboardAction[] {
  return (
    input
      // If a mod uploads, it skips the verification and goes straight to pending
      // In these cases, don't show in the dashboard. This is the only case where it
      // will be not uploaded but lack a modId.
      .filter(
        dbComicUpload =>
          !(dbComicUpload.publishStatus !== 'uploaded' && !dbComicUpload.modId)
      )
      .map(dbComicUpload => {
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
            CONTRIBUTION_POINTS.comicUpload[dbComicUpload.verdict]
              .actionDashboardDescription;
          const isRejected =
            dbComicUpload.verdict === 'rejected' ||
            dbComicUpload.verdict === 'rejected-list';

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
          timestamp: parseDbDateStr(dbComicUpload.timestamp),
          user: dbComicUpload.uploadUsername
            ? {
                userId: dbComicUpload.uploadUserId,
                username: dbComicUpload.uploadUsername,
              }
            : { ip: dbComicUpload.uploadUserIP },
          verdict: isProcessed ? fullVerdictText : undefined,
          assignedMod:
            dbComicUpload.modId && dbComicUpload.modName
              ? { userId: dbComicUpload.modId, username: dbComicUpload.modName }
              : undefined,
        };
      })
  );
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

function mapDbPendingComicProblems(input: DbPendingComicSimple[]): DashboardAction[] {
  return input.map(dbPending => {
    return {
      type: 'pendingComicProblem',
      id: dbPending.comicId,
      comicId: dbPending.comicId,
      primaryField: `${dbPending.comicName} - ${dbPending.artistName}`,
      isProcessed: false,
      timestamp: parseDbDateStr(dbPending.timestamp),
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
}

function getTagSuggestionGroupDescription(group: TagSuggestionGroup): string {
  const areBoth = group.addTags.length > 0 && group.removeTags.length > 0;
  if (areBoth) {
    return `Add ${group.addTags.length}, Remove ${group.removeTags.length}`;
  }
  if (group.addTags.length === 1) {
    return `Add "${group.addTags[0].name}"`;
  }
  if (group.removeTags.length === 1) {
    return `Remove "${group.removeTags[0].name}"`;
  }
  if (group.addTags.length > 0) {
    return `Add ${group.addTags.length}`;
  }
  if (group.removeTags.length > 0) {
    return `Remove ${group.removeTags.length}`;
  }
  return '???';
}
