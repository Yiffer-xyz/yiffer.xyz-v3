import type { ModScore } from '~/route-funcs/get-mod-scoreboard';
import Link from '~/ui-components/Link';
import ModContributionPointInfo from '~/ui-components/ModContributionPointInfo';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';

export default function ModScoreboard({ modScoreboard }: { modScoreboard: ModScore[] }) {
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
                <Link href={`/admin/users/${score.userId}`} text={score.username} />
              </TableCell>

              <TableCell>{score.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
