import { Outlet, useNavigate, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import SearchableSelect from '~/components/SearchableSelect/SearchableSelect';
import { ComicTiny } from '~/types/types';
import { GlobalAdminContext } from '../admin';

export default function ManageComics({}) {
  const navigate = useNavigate();

  const [selectedComic, setSelectedComic] = useState<ComicTiny>();

  const globalContext: GlobalAdminContext = useOutletContext();

  const comicOptions = globalContext.comics.map(comic => ({
    value: comic,
    text: comic.name,
  }));

  // update url on selected comic change
  useEffect(() => {
    if (!selectedComic) return;
    navigate(`/admin/comics/${selectedComic.id}`);
  }, [selectedComic]);

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
