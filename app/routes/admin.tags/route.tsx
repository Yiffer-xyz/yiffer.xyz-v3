import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutlet,
  useOutletContext,
} from '@remix-run/react';
import { useMemo, useState } from 'react';
import type { GlobalAdminContext } from '~/routes/admin/route';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import Link from '~/ui-components/Link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import TextInput from '~/ui-components/TextInput/TextInput';
import { getTagsWithUsageCount } from '~/route-funcs/get-tags';
import { processApiError } from '~/utils/request-helpers';
import { capitalizeString } from '~/utils/general';
import Button from '~/ui-components/Buttons/Button';
import { MdAdd } from 'react-icons/md';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Tags | Yiffer.xyz` }];
};

export default function ManageTags() {
  const { tagsWithCounts } = useLoaderData<typeof loader>();
  const globalContext: GlobalAdminContext = useOutletContext();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const tagOptions = useMemo(() => {
    const tags = tagsWithCounts.map(tag => ({
      value: tag,
      text: tag.tag.name,
    }));

    if (!search) {
      return tags;
    }

    return tags.filter(tag => tag.text.toLowerCase().includes(search.toLowerCase()));
  }, [tagsWithCounts, search]);

  return (
    <>
      <h1>Tag manager</h1>

      {!outlet && (
        <>
          <Button
            text="Create new tag"
            onClick={() => {
              navigate('/admin/tags/new');
            }}
            startIcon={MdAdd}
            className="mt-2"
          />

          <TextInput
            value={search}
            onChange={setSearch}
            label="Search tag name"
            name="tag-search"
            className="mb-4 mt-2 max-w-sm"
            clearable
          />

          {tagOptions.length > 0 && (
            <>
              <Table className="mb-6" horizontalScroll>
                <TableHeadRow>
                  <TableCell>Count</TableCell>
                  <TableCell>Tag name</TableCell>
                </TableHeadRow>
                <TableBody>
                  {tagOptions.map(tag => (
                    <TableRow key={tag.value.tag.id}>
                      <TableCell>{tag.value.count}</TableCell>
                      <TableCell>
                        <p>
                          <Link
                            href={`/admin/tags/${tag.value.tag.id}`}
                            text={capitalizeString(tag.text)}
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

export async function loader(args: LoaderFunctionArgs) {
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
}
