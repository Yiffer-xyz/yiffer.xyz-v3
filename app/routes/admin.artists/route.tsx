import { Outlet, useOutlet, useOutletContext } from '@remix-run/react';
import { useMemo, useState } from 'react';
import type { GlobalAdminContext } from '~/routes/admin/route';
import type { MetaFunction } from '@remix-run/cloudflare';
import Link from '~/ui-components/Link';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import TextInput from '~/ui-components/TextInput/TextInput';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Artists | Yiffer.xyz` }];
};

export default function ManageArtists() {
  const globalContext: GlobalAdminContext = useOutletContext();
  const outlet = useOutlet();

  const [search, setSearch] = useState('');

  const artistOptions = useMemo(() => {
    const artists = globalContext.artists.map(artist => ({
      value: artist,
      text: artist.name,
    }));

    if (!search) {
      return artists;
    }

    return artists.filter(artist =>
      artist.text.toLowerCase().includes(search.toLowerCase())
    );
  }, [globalContext.artists, search]);

  return (
    <>
      <h1>Artist manager</h1>

      {!outlet && (
        <>
          <TextInput
            value={search}
            onChange={setSearch}
            label="Search artist name"
            name="artist-search"
            className="mb-4 mt-2 max-w-sm"
            clearable
          />

          {artistOptions.length > 0 && (
            <>
              <Table className="mb-6" horizontalScroll>
                <TableBody>
                  {artistOptions.map((artist, index) => (
                    <TableRow key={artist.value.id} includeBorderTop={index === 0}>
                      <TableCell>
                        <p>
                          <Link
                            href={`/admin/artists/${artist.value.id}`}
                            text={artist.text}
                            showRightArrow
                            isInsideParagraph
                          />
                        </p>
                      </TableCell>
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
