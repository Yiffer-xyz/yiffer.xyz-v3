import Table from './Table';
import TableBody from './TableBody';
import TableCell from './TableCell';
import TableHeadRow from './TableHeadRow';
import TableRow from './TableRow';

export { Table, TableBody, TableCell, TableHeadRow, TableRow };

/**
USAGE:
<Table>                               // Has props for scrolling vertically and horizontally
  <TableHeadRow>                      // Needs a prop for being sticky if vertical scroll
    <TableCell>Column 1</TableCell>   // All TableCells can have a maxWith prop to wrap text,
    <TableCell>Column 2</TableCell>   // which is useful if there can be a lot of it
  </TableHeadRow>
  <TableBody>
    <TableRow>
      <TableCell>data</TableCell>
      <TableCell>data</TableCell>
    </TableRow>
  </TableBody>
</Table>
*/
