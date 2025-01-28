import { Outlet, useOutlet, useOutletContext } from '@remix-run/react';
import { useMemo, useState } from 'react';
import type { GlobalAdminContext } from '~/routes/admin/route';
import type { MetaFunction } from '@remix-run/cloudflare';
import Link from '~/ui-components/Link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import TextInput from '~/ui-components/TextInput/TextInput';
import { capitalizeString } from '~/utils/general';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Comics | Yiffer.xyz` }];
};

export default function ManageComics() {
  const globalContext: GlobalAdminContext = useOutletContext();
  const outlet = useOutlet();

  const [search, setSearch] = useState('');

  const { comicOptions, totalNum } = useMemo(() => {
    let comics = globalContext.comics.map(comic => ({
      value: comic,
      text: comic.name,
    }));

    let slicedComics: typeof comics;
    if (!search) {
      slicedComics = comics.slice(0, 50);
    } else {
      comics = comics.filter(comic =>
        comic.text.toLowerCase().includes(search.toLowerCase())
      );
      slicedComics = comics.slice(0, 50);
    }

    return {
      comicOptions: slicedComics,
      totalNum: comics.length,
    };
  }, [globalContext.comics, search]);

  return (
    <>
      <h1>Comic manager</h1>

      {!outlet && (
        <>
          <div className="mt-2 mb-4">
            <Link href="/contribute/upload" text="Upload new comic" showRightArrow />
          </div>

          <TextInput
            value={search}
            onChange={setSearch}
            label="Search comic name"
            name="comic-search"
            className="mb-4 max-w-sm"
            clearable
          />

          {comicOptions.length > 0 && (
            <>
              {totalNum > comicOptions.length && (
                <p className="text-sm text-gray-500 dark:text-gray-900">
                  Showing {comicOptions.length} of {totalNum} comics
                </p>
              )}
              <Table className="mb-6" horizontalScroll>
                <TableHeadRow>
                  <TableCell>Comic name</TableCell>
                  <TableCell>Status</TableCell>
                </TableHeadRow>

                <TableBody>
                  {comicOptions.map(comic => (
                    <TableRow key={comic.value.id}>
                      <TableCell>
                        <p>
                          <Link
                            href={`/admin/comics/${comic.value.id}`}
                            text={comic.text}
                            showRightArrow
                            isInsideParagraph
                          />
                        </p>
                      </TableCell>
                      <TableCell>{capitalizeString(comic.value.publishStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </>
      )}

      <Outlet context={globalContext} />
    </>
  );
}
