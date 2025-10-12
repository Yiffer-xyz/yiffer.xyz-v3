import type { ModScore } from '~/route-funcs/get-mod-scoreboard';
import ModContributionPointInfo from '~/ui-components/ModContributionPointInfo';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import Username from '~/ui-components/Username';

export default function ModScoreboard({
  modScoreboard,
  pagesPath,
}: {
  modScoreboard: ModScore[];
  pagesPath: string;
}) {
  return (
    <>
      <h2>Mod Scoreboard</h2>

      <div className="mb-2">
        <ModContributionPointInfo />
      </div>

      <Table>
        <TableHeadRow>
          <TableCell>User</TableCell>
          <TableCell>Points</TableCell>
        </TableHeadRow>
        <TableBody>
          {modScoreboard.map(score => (
            <TableRow key={score.userId}>
              <TableCell>
                <Username
                  id={score.userId}
                  username={score.username}
                  pagesPath={pagesPath}
                  showRightArrow={false}
                />
              </TableCell>

              <TableCell>{score.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
