import { R2_CONNECTION_LIMIT } from '~/types/constants';
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

export async function batchRenameR2Files({
  r2,
  oldKeys,
  newKeys,
  isLocalDev,
  imagesServerUrl,
}: {
  r2: R2Bucket;
  oldKeys: string[];
  newKeys: string[];
  isLocalDev: boolean;
  imagesServerUrl: string;
}): Promise<void> {
  if (isLocalDev) {
    for (let i = 0; i < oldKeys.length; i++) {
      const oldKey = oldKeys[i];
      const newKey = newKeys[i];
      await renameR2File({ r2, oldKey, newKey, isLocalDev: true, imagesServerUrl });
    }
  }

  // Batch these so there's only 4 connections at a time, because of limits
  for (let i = 0; i < oldKeys.length; i += R2_CONNECTION_LIMIT) {
    const batchOldKeys = oldKeys.slice(i, i + R2_CONNECTION_LIMIT);
    const batchNewKeys = newKeys.slice(i, i + R2_CONNECTION_LIMIT);
    const batchPromises = batchOldKeys.map((oldKey, index) =>
      renameR2File({
        r2,
        oldKey,
        newKey: batchNewKeys[index],
        isLocalDev: false,
        imagesServerUrl,
      })
    );
    await Promise.all(batchPromises);
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
