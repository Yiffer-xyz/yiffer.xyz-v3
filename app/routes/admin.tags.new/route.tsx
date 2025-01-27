import { useNavigate } from '@remix-run/react';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Button from '~/ui-components/Buttons/Button';
import { MdCheckCircle } from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { redirectIfNotMod } from '~/utils/loaders';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: New tag | Yiffer.xyz` }];
};

export default function ManageTag() {
  const navigate = useNavigate();

  const [tagName, setTagName] = useState('');

  const submitFetcher = useGoodFetcher({
    method: 'post',
    onFinish: () => {
      navigate('/admin/tags');
    },
    toastSuccessMessage: `Tag ${tagName} created`,
  });

  function onSubmit() {
    const formData = new FormData();
    formData.append('tagName', tagName);
    submitFetcher.submit(formData);
  }

  function onCancel() {
    navigate('/admin/tags');
  }

  return (
    <div className="mt-2">
      <h2>New tag</h2>

      <p className="font-semibold mt-2">
        <MdCheckCircle className="mb-1 mr-1" />
        Things that <u>should</u> be tags
      </p>
      <ul>
        <li>
          Characters that are not fursonas, including (eg. movie/game characters, pokemon,
          webcomic characters, mascots)
        </li>
        <li>Universe of characters (eg. “fnaf”, “twokinds”, “zootopia”)</li>
        <li>
          Species and general species family (most of these are added, confer with admin
          before adding more)
        </li>
        <li>
          Kinks/fetishes, but not too specific (good: “musk”, “choking”, “sheath play”)
        </li>
        <li className="font-semibold">
          A general rule: Something should only be a tag if a reasonable amount of people
          will search for it
        </li>
      </ul>

      <p className="font-semibold mt-6">
        <IoMdCloseCircle className="mb-1 mr-1" />
        Things that should <u>not</u> be tags
      </p>
      <ul>
        <li>
          Overly specific details about sexual acts (eg. “cum in mouth”, “creampie
          eating”)
        </li>
        <li>Most bodily descriptions (eg. “green skin”, “black hair”, “tail”)</li>
        <li>
          Descriptions of genders involved - we have filters for this and that’s enough
        </li>
        <li>
          Descriptions of things involved that aren’t really kinks/fetishes (eg. “sheath”,
          “paws”, “shower”, “sports”)
        </li>
      </ul>

      <TextInput
        label="New tag name"
        value={tagName}
        onChange={setTagName}
        name="tagName"
        className="mt-4 max-w-xs"
      />

      <div className="flex flex-row gap-3">
        <Button text="Cancel" variant="outlined" onClick={onCancel} className="mt-4" />

        <LoadingButton
          isLoading={false}
          text="Create tag"
          onClick={onSubmit}
          className="mt-4"
          disabled={tagName.length < 2}
        />
      </div>
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const data = await args.request.formData();
  const tagName = data.get('tagName');

  if (!tagName) return create400Json('Tag name is required');

  const query = 'INSERT INTO keyword (keywordName) VALUES (?)';
  const params = [tagName];

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    query,
    params,
    'Tag creation'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error creating tag', { tagName });
  }

  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    actionType: 'tag-updated',
    text: `Tag ${tagName} created`,
  });
  if (modLogErr) {
    return processApiError('Error logging in tag creation', modLogErr, { tagName });
  }

  return createSuccessJson();
}
