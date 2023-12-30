import { Outlet, useNavigate, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import SearchableSelect from '~/ui-components/SearchableSelect/SearchableSelect';
import type { Tag } from '~/types/types';
import type { GlobalAdminContext } from '../admin';

export default function ManageTags() {
  const navigate = useNavigate();

  const [selectedTag, setSelectedTag] = useState<Tag>();

  const globalContext: GlobalAdminContext = useOutletContext();

  const tagOptions = globalContext.tags.map(tag => ({
    value: tag,
    text: tag.name,
  }));

  // update url on selected tag change
  useEffect(() => {
    if (!selectedTag) return;
    navigate(`/admin/tags/${selectedTag.id}`);
  }, [selectedTag, navigate]);

  return (
    <>
      <h1>Tag manager</h1>

      <p className="font-bold my-4">ℹ️ See the figma prototype.</p>

      <SearchableSelect
        options={tagOptions}
        value={selectedTag}
        onChange={setSelectedTag}
        onValueCleared={() => setSelectedTag(undefined)}
        title="Select tag"
        name="tag"
        className="mb-8"
      />

      <Outlet context={globalContext} />
    </>
  );
}
