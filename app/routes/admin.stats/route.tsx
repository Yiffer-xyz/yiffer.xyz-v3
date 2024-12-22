import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { MdCheck, MdClose } from 'react-icons/md';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { makeDbErr, processApiError } from '~/utils/request-helpers';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

type SiteStats = {
  totalUsers: number;
  totalComics: number;
  totalArtists: number;
  totalPages: number;
  adPayments: {
    amount: number;
    year: number;
  }[];
  ads: {
    card: {
      active: number;
      expired: number;
    };
    banner: {
      active: number;
      expired: number;
    };
    topSmall: {
      active: number;
      expired: number;
    };
  };
  contributions: {
    loggedIn: ContributionData;
    guests: ContributionData;
  };
};

type ContributionData = {
  comicUploadRejected: number;
  comicUploadterrible: number;
  comicUploadpageissues: number;
  comicUploadmajorissues: number;
  comicUploadminorissues: number;
  comicUploadexcellent: number;
  comicSuggestiongood: number;
  comicSuggestionbad: number;
  comicSuggestionRejected: number;
  comicProblem: number;
  comicProblemRejected: number;
  tagSuggestion: number;
  tagSuggestionRejected: number;
};

const emptyContributionData: ContributionData = {
  comicUploadRejected: 0,
  comicUploadterrible: 0,
  comicUploadpageissues: 0,
  comicUploadmajorissues: 0,
  comicUploadminorissues: 0,
  comicUploadexcellent: 0,
  comicSuggestiongood: 0,
  comicSuggestionbad: 0,
  comicSuggestionRejected: 0,
  comicProblem: 0,
  comicProblemRejected: 0,
  tagSuggestion: 0,
  tagSuggestionRejected: 0,
};

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Stats | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const dbStatements: QueryWithParams[] = [
    { query: 'SELECT COUNT(*) AS count FROM user', queryName: 'Users, stats' },
    {
      query: `SELECT COUNT(*) AS count FROM comic WHERE publishStatus = 'published'`,
      queryName: 'Comics, stats',
    },
    {
      query:
        'SELECT COUNT(*) AS count FROM artist WHERE isBanned = 0 AND isPending = 0 AND isRejected = 0',
      queryName: 'Artists, stats',
    },
    {
      query: `SELECT SUM(numberOfpages) AS count FROM comic WHERE publishStatus = 'published'`,
      queryName: 'Pages, stats',
    },
    {
      query: `SELECT
        COUNT(*) AS count, status, adType FROM advertisement WHERE status = 'ACTIVE' OR status = 'ENDED'
        GROUP BY status, adType`,
      queryName: 'Ads, stats',
    },
    {
      query: `SELECT
          CASE WHEN userid IS NULL THEN 1 ELSE 0 END AS isGuest,
          SUM(tagSuggestion) AS tagSuggestion,
          SUM(tagSuggestionRejected) AS tagSuggestionRejected,
          SUM(comicProblem) AS comicProblem,
          SUM(comicProblemRejected) AS comicProblemRejected,
          SUM(comicSuggestiongood) AS comicSuggestiongood,
          SUM(comicSuggestionbad) AS comicSuggestionbad,
          SUM(comicSuggestionRejected) AS comicSuggestionRejected,
          SUM(comicUploadexcellent) AS comicUploadexcellent,
          SUM(comicUploadminorissues) AS comicUploadminorissues,
          SUM(comicUploadmajorissues) AS comicUploadmajorissues,
          SUM(comicUploadpageissues) AS comicUploadpageissues,
          SUM(comicUploadterrible) AS comicUploadterrible,
          SUM(comicUploadRejected) AS comicUploadRejected
        FROM contributionpoints
        LEFT JOIN user ON (user.id = contributionpoints.userId)
        WHERE (
          user.UserType IS NULL
          OR (user.UserType != 'moderator' AND user.userType != 'admin')
        )
        GROUP BY isGuest`,
      queryName: 'Contributions, stats',
    },
    {
      query: `SELECT SUM(amount) AS amount, strftime('%Y', registeredDate) AS year
        FROM advertisementpayment GROUP BY year ORDER BY year desc`,
      queryName: 'Ad payments, stats',
    },
  ];

  const dbRes = await queryDbMultiple<
    [
      [{ count: number }],
      [{ count: number }],
      [{ count: number }],
      [{ count: number }],
      {
        count: number;
        status: 'ACTIVE' | 'ENDED';
        adType: 'topSmall' | 'card' | 'banner';
      }[],
      {
        isGuest: number;
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
      }[],
      {
        amount: number;
        year: number;
      }[],
    ]
  >(args.context.cloudflare.env.DB, dbStatements);

  if (dbRes.isError) {
    return await processApiError(
      'Error in GET /stats',
      makeDbErr(dbRes, 'Error getting all the stats together')
    );
  }
  const adsRes = dbRes.result[4];
  const contribRes = dbRes.result[5];

  const siteStats: SiteStats = {
    totalUsers: dbRes.result[0][0].count,
    totalComics: dbRes.result[1][0].count,
    totalArtists: dbRes.result[2][0].count,
    totalPages: dbRes.result[3][0].count,
    adPayments: dbRes.result[6],
    ads: {
      banner: {
        active:
          adsRes.find(adRes => adRes.adType === 'banner' && adRes.status === 'ACTIVE')
            ?.count || 0,
        expired:
          adsRes.find(adRes => adRes.adType === 'banner' && adRes.status === 'ENDED')
            ?.count || 0,
      },
      card: {
        active:
          adsRes.find(adRes => adRes.adType === 'card' && adRes.status === 'ACTIVE')
            ?.count || 0,
        expired:
          adsRes.find(adRes => adRes.adType === 'card' && adRes.status === 'ENDED')
            ?.count || 0,
      },
      topSmall: {
        active:
          adsRes.find(adRes => adRes.adType === 'topSmall' && adRes.status === 'ACTIVE')
            ?.count || 0,
        expired:
          adsRes.find(adRes => adRes.adType === 'topSmall' && adRes.status === 'ENDED')
            ?.count || 0,
      },
    },
    contributions: {
      loggedIn: (contribRes.find(c => c.isGuest === 0) ??
        emptyContributionData) as ContributionData,
      guests: (contribRes.find(c => c.isGuest === 1) ??
        emptyContributionData) as ContributionData,
    },
  };

  return siteStats;
}

export default function Stats() {
  const stats = useLoaderData<typeof loader>();
  const ads = stats.ads;
  const contrib = stats.contributions;

  const guestUploadTotal =
    contrib.guests.comicUploadRejected +
    contrib.guests.comicUploadexcellent +
    contrib.guests.comicUploadmajorissues +
    contrib.guests.comicUploadminorissues +
    contrib.guests.comicUploadpageissues +
    contrib.guests.comicUploadterrible;
  const guestUploadAccepted = guestUploadTotal - contrib.guests.comicUploadRejected;
  const guestUploadRejected = guestUploadTotal - guestUploadAccepted;

  const userUploadTotal =
    contrib.loggedIn.comicUploadRejected +
    contrib.loggedIn.comicUploadexcellent +
    contrib.loggedIn.comicUploadmajorissues +
    contrib.loggedIn.comicUploadminorissues +
    contrib.loggedIn.comicUploadpageissues +
    contrib.loggedIn.comicUploadterrible;
  const userUploadAccepted = userUploadTotal - contrib.loggedIn.comicUploadRejected;
  const userUploadRejected = userUploadTotal - userUploadAccepted;

  const uploadsTotal = guestUploadTotal + userUploadTotal;

  const comicSuggLoggedIn =
    contrib.loggedIn.comicSuggestiongood + contrib.loggedIn.comicSuggestionbad;
  const comicSuggGuests =
    contrib.guests.comicSuggestiongood + contrib.guests.comicSuggestionbad;
  const comicSuggTotal = comicSuggLoggedIn + comicSuggGuests;

  const comicProbTotal =
    contrib.loggedIn.comicProblem +
    contrib.guests.comicProblem +
    contrib.loggedIn.comicProblemRejected +
    contrib.guests.comicProblemRejected;

  const tagSuggTotal =
    contrib.loggedIn.tagSuggestion +
    contrib.guests.tagSuggestion +
    contrib.loggedIn.tagSuggestionRejected +
    contrib.guests.tagSuggestionRejected;

  return (
    <>
      <h1>Stats</h1>

      <h2>General</h2>
      <p>
        <b>{stats.totalUsers}</b> users
      </p>
      <p>
        <b>{stats.totalComics}</b> comics
      </p>
      <p>
        <b>{stats.totalArtists}</b> artists
      </p>
      <p>
        <b>{stats.totalPages}</b> pages
      </p>

      <h2 className="mt-4">Contributions</h2>
      <Table horizontalScroll>
        <TableHeadRow>
          <TableCell> </TableCell>
          <TableCell>Total</TableCell>
          <TableCell>Users</TableCell>
          <TableCell>Guests</TableCell>
        </TableHeadRow>
        <TableBody className="text-green-600 dark:text-green-400">
          <TableRow>
            <TableCell>
              <b>Uploads total</b>
            </TableCell>
            <TableCell>{uploadsTotal}</TableCell>
            <TableCell>{userUploadTotal}</TableCell>
            <TableCell>{guestUploadTotal}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <b>
                <MdCheck /> Accepted tot
              </b>
            </TableCell>
            <TableCell>
              {guestUploadAccepted + userUploadAccepted}{' '}
              {getRoundedPercent(guestUploadAccepted + userUploadAccepted, uploadsTotal)}
            </TableCell>
            <TableCell>
              {userUploadAccepted}{' '}
              {getRoundedPercent(userUploadAccepted, userUploadTotal)}
            </TableCell>
            <TableCell>
              {guestUploadAccepted}{' '}
              {getRoundedPercent(guestUploadAccepted, guestUploadTotal)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Excellent
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadexcellent +
                contrib.guests.comicUploadexcellent}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicUploadexcellent +
                  contrib.guests.comicUploadexcellent,
                uploadsTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadexcellent}{' '}
              {getRoundedPercent(contrib.loggedIn.comicUploadexcellent, userUploadTotal)}
            </TableCell>
            <TableCell>
              {contrib.guests.comicUploadexcellent}{' '}
              {getRoundedPercent(contrib.guests.comicUploadexcellent, guestUploadTotal)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Minor issues
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadminorissues +
                contrib.guests.comicUploadminorissues}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicUploadminorissues +
                  contrib.guests.comicUploadminorissues,
                uploadsTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadminorissues}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicUploadminorissues,
                userUploadTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.guests.comicUploadminorissues}{' '}
              {getRoundedPercent(contrib.guests.comicUploadminorissues, guestUploadTotal)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Major issues
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadmajorissues +
                contrib.guests.comicUploadmajorissues}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicUploadmajorissues +
                  contrib.guests.comicUploadmajorissues,
                uploadsTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadmajorissues}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicUploadmajorissues,
                userUploadTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.guests.comicUploadmajorissues}{' '}
              {getRoundedPercent(contrib.guests.comicUploadmajorissues, guestUploadTotal)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Page issues
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadpageissues +
                contrib.guests.comicUploadpageissues}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicUploadpageissues +
                  contrib.guests.comicUploadpageissues,
                uploadsTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadpageissues}{' '}
              {getRoundedPercent(contrib.loggedIn.comicUploadpageissues, userUploadTotal)}
            </TableCell>
            <TableCell>
              {contrib.guests.comicUploadpageissues}{' '}
              {getRoundedPercent(contrib.guests.comicUploadpageissues, guestUploadTotal)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Terrible
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadterrible + contrib.guests.comicUploadterrible}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicUploadterrible + contrib.guests.comicUploadterrible,
                uploadsTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicUploadterrible}{' '}
              {getRoundedPercent(contrib.loggedIn.comicUploadterrible, userUploadTotal)}
            </TableCell>
            <TableCell>
              {contrib.guests.comicUploadterrible}{' '}
              {getRoundedPercent(contrib.guests.comicUploadterrible, guestUploadTotal)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <b>
                <MdClose /> Rejected
              </b>
            </TableCell>
            <TableCell>
              {guestUploadRejected + userUploadRejected}{' '}
              {getRoundedPercent(guestUploadRejected + userUploadRejected, uploadsTotal)}
            </TableCell>
            <TableCell>
              {userUploadRejected}{' '}
              {getRoundedPercent(userUploadRejected, userUploadTotal)}
            </TableCell>
            <TableCell>
              {guestUploadRejected}{' '}
              {getRoundedPercent(guestUploadRejected, guestUploadTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody className="dark:text-blue-400 text-blue-600">
          <TableRow>
            <TableCell>
              <b>Comic suggestions</b>
            </TableCell>
            <TableCell>{comicSuggTotal}</TableCell>
            <TableCell>{comicSuggLoggedIn}</TableCell>
            <TableCell>{comicSuggGuests}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Good
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicSuggestiongood + contrib.guests.comicSuggestiongood}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicSuggestiongood + contrib.guests.comicSuggestiongood,
                comicSuggTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicSuggestiongood}{' '}
              {getRoundedPercent(contrib.loggedIn.comicSuggestiongood, comicSuggLoggedIn)}
            </TableCell>
            <TableCell>
              {contrib.guests.comicSuggestiongood}{' '}
              {getRoundedPercent(contrib.guests.comicSuggestiongood, comicSuggGuests)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Bad
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicSuggestionbad + contrib.guests.comicSuggestionbad}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicSuggestionbad + contrib.guests.comicSuggestionbad,
                comicSuggTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicSuggestionbad}{' '}
              {getRoundedPercent(contrib.loggedIn.comicSuggestionbad, comicSuggLoggedIn)}
            </TableCell>
            <TableCell>
              {contrib.guests.comicSuggestionbad}{' '}
              {getRoundedPercent(contrib.guests.comicSuggestionbad, comicSuggGuests)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdClose /> Rejected
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicSuggestionRejected +
                contrib.guests.comicSuggestionRejected}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicSuggestionRejected +
                  contrib.guests.comicSuggestionRejected,
                comicSuggTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicSuggestionRejected}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicSuggestionRejected,
                comicSuggLoggedIn
              )}
            </TableCell>
            <TableCell>
              {contrib.guests.comicSuggestionRejected}{' '}
              {getRoundedPercent(contrib.guests.comicSuggestionRejected, comicSuggGuests)}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody className="dark:text-purple-400 text-purple-600">
          <TableRow>
            <TableCell>
              <b>Comic problems</b>
            </TableCell>
            <TableCell>{comicProbTotal}</TableCell>
            <TableCell>
              {contrib.loggedIn.comicProblem + contrib.loggedIn.comicProblemRejected}
            </TableCell>
            <TableCell>
              {contrib.guests.comicProblem + contrib.guests.comicProblemRejected}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Approved
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicProblem + contrib.guests.comicProblem}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicProblem + contrib.guests.comicProblem,
                comicProbTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.comicProblem}{' '}
              {getRoundedPercent(
                contrib.loggedIn.comicProblem,
                contrib.loggedIn.comicProblem + contrib.loggedIn.comicProblemRejected
              )}
            </TableCell>
            <TableCell>
              {contrib.guests.comicProblem}{' '}
              {getRoundedPercent(
                contrib.guests.comicProblem,
                contrib.guests.comicProblem + contrib.guests.comicProblemRejected
              )}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody className="dark:text-yellow-500 text-yellow-600">
          <TableRow>
            <TableCell>
              <b>Tag suggestions</b>
            </TableCell>
            <TableCell>{tagSuggTotal}</TableCell>
            <TableCell>
              {contrib.loggedIn.tagSuggestion + contrib.guests.tagSuggestionRejected}
            </TableCell>
            <TableCell>
              {contrib.guests.tagSuggestion + contrib.guests.tagSuggestionRejected}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <MdCheck /> Approved
            </TableCell>
            <TableCell>
              {contrib.loggedIn.tagSuggestion + contrib.guests.tagSuggestion}{' '}
              {getRoundedPercent(
                contrib.loggedIn.tagSuggestion + contrib.guests.tagSuggestion,
                tagSuggTotal
              )}
            </TableCell>
            <TableCell>
              {contrib.loggedIn.tagSuggestion}{' '}
              {getRoundedPercent(
                contrib.loggedIn.tagSuggestion,
                contrib.loggedIn.tagSuggestion + contrib.loggedIn.tagSuggestionRejected
              )}
            </TableCell>
            <TableCell>
              {contrib.guests.tagSuggestion}{' '}
              {getRoundedPercent(
                contrib.guests.tagSuggestion,
                contrib.guests.tagSuggestion + contrib.guests.tagSuggestionRejected
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <h2 className="mt-4">Avertising</h2>
      <div className="flex flex-row flex-wrap gap-x-8 gap-y-4">
        <Table className="h-fit">
          <TableHeadRow>
            <TableCell>Ad type</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Expired</TableCell>
          </TableHeadRow>
          <TableBody>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>
                {ads.banner.active + ads.card.active + ads.topSmall.active}
              </TableCell>
              <TableCell>
                {ads.banner.expired + ads.card.expired + ads.topSmall.expired}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Card</TableCell>
              <TableCell>{ads.card.active}</TableCell>
              <TableCell>{ads.card.expired}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Banner</TableCell>
              <TableCell>{ads.banner.active}</TableCell>
              <TableCell>{ads.banner.expired}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Top of page</TableCell>
              <TableCell>{ads.topSmall.active}</TableCell>
              <TableCell>{ads.topSmall.expired}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table className="h-fit">
          <TableHeadRow>
            <TableCell>Year</TableCell>
            <TableCell>Money</TableCell>
          </TableHeadRow>
          <TableBody>
            {stats.adPayments.map(({ year, amount }) => (
              <TableRow key={year}>
                <TableCell>{year}</TableCell>
                <TableCell>${amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function getRoundedPercent(num?: number, total?: number) {
  if (!num || !total) return '';
  return '(' + Math.round((num / total) * 100) + '%)';
}
