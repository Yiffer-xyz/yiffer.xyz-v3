import { Outlet, useNavigate, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import SearchableSelect from '~/ui-components/SearchableSelect/SearchableSelect';
import type { ComicTiny } from '~/types/types';
import type { GlobalAdminContext } from '~/routes/admin/route';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function ManageComics() {
  const navigate = useNavigate();
  const globalContext: GlobalAdminContext = useOutletContext();

  const [selectedComic, setSelectedComic] = useState<ComicTiny>();

  const comicOptions = globalContext.comics.map(comic => ({
    value: comic,
    text: comic.name,
  }));

  // update url on selected comic change
  useEffect(() => {
    if (!selectedComic) return;
    navigate(`/admin/comics/${selectedComic.id}`);
  }, [selectedComic, navigate]);

  return (
    <>
      <h1>Comic manager</h1>

      <SearchableSelect
        options={comicOptions}
        value={selectedComic}
        onChange={setSelectedComic}
        onValueCleared={() => setSelectedComic(undefined)}
        title="Select comic"
        name="comic"
        className="mb-8"
      />

      <Outlet context={globalContext} />
    </>
  );
}
