import type { LocalDevManageFilesBody } from '~/types/types';

export async function deleteR2File({
  r2,
  key,
  isLocalDev,
  imagesServerUrl,
}: {
  r2: R2Bucket;
  key: string;
  isLocalDev: boolean;
  imagesServerUrl: string;
}) {
  if (isLocalDev) {
    const body: LocalDevManageFilesBody = { renames: [], deletes: [{ path: key }] };
    const res = await fetch(`${imagesServerUrl}/local-dev-manage-files`, {
      body: JSON.stringify(body),
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error('Error deleting file locally');
    }
  } else {
    await r2.delete(key);
  }
}

export async function renameR2File({
  r2,
  oldKey,
  newKey,
  isLocalDev,
  imagesServerUrl,
}: {
  r2: R2Bucket;
  oldKey: string;
  newKey: string;
  isLocalDev: boolean;
  imagesServerUrl: string;
}) {
  if (isLocalDev) {
    const body: LocalDevManageFilesBody = {
      renames: [{ oldPath: oldKey, newPath: newKey }],
      deletes: [],
    };
    const res = await fetch(`${imagesServerUrl}/local-dev-manage-files`, {
      body: JSON.stringify(body),
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error('Error renaming file locally');
    }
  } else {
    const file = await r2.get(oldKey);
    if (!file) return;
    await r2.put(newKey, file.body);
    await r2.delete(oldKey);
  }
}
