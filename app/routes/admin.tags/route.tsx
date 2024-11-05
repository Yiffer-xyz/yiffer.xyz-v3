import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
} from '@remix-run/react';
import { unstable_defineLoader } from '@remix-run/cloudflare';
import { useState } from 'react';
import SearchableSelect from '~/ui-components/SearchableSelect/SearchableSelect';
import type { Tag } from '~/types/types';
import type { GlobalAdminContext } from '../admin/route';
import Button from '~/ui-components/Buttons/Button';
import { MdAdd } from 'react-icons/md';
import { getTagsWithUsageCount } from '~/route-funcs/get-tags';
import { processApiError } from '~/utils/request-helpers';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import Link from '~/ui-components/Link';
import { capitalizeString } from '~/utils/general';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function ManageTags() {
  const globalContext: GlobalAdminContext = useOutletContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { tagsWithCounts } = useLoaderData<typeof loader>();

  const [selectedTag, setSelectedTag] = useState<Tag>();

  const isCreating = pathname.includes('/new');
  const hasSelected = /\/tags\/\d+/.test(pathname);

  const tagOptions = globalContext.tags.map(tag => ({
    value: tag,
    text: tag.name,
  }));

  return (
    <>
      <h1>Tag manager</h1>

      {!isCreating && (
        <>
          <Button
            text="Create new tag"
            startIcon={MdAdd}
            variant="outlined"
            className="mb-4 mt-4"
            onClick={() => {
              setSelectedTag(undefined);
              navigate('/admin/tags/new');
            }}
          />

          <SearchableSelect
            options={tagOptions}
            value={selectedTag}
            clearOnFocus
            onChange={newTag => {
              setSelectedTag(newTag);
              navigate(`/admin/tags/${newTag.id}`);
            }}
            onValueCleared={() => {
              setSelectedTag(undefined);
            }}
            title="Find tag"
            name="tag"
            className="mb-6 mt-6"
          />
        </>
      )}

      <Outlet context={globalContext} />

      {!isCreating && (
        <div className={hasSelected ? 'mt-10' : ''}>
          <p className="font-semibold mb-2">All tags, ordered by usage</p>
          <Table className="border-gray-borderLight border-t">
            <TableBody>
              {tagsWithCounts.map(({ count, tag }) => (
                <TableRow key={tag.id}>
                  <TableCell>{count}</TableCell>
                  <TableCell>
                    <Link
                      showRightArrow
                      text={capitalizeString(tag.name)}
                      href={`/admin/tags/${tag.id}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

export const loader = unstable_defineLoader(async args => {
  const tagsWithCountsRes = await getTagsWithUsageCount(args.context.cloudflare.env.DB);
  if (tagsWithCountsRes.err) {
    return processApiError(
      'Error getting tags with counts in admin/tags',
      tagsWithCountsRes.err
    );
  }

  return {
    tagsWithCounts: tagsWithCountsRes.result,
  };
});
