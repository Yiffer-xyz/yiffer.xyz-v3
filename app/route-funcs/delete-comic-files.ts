import type { ApiError } from '~/utils/request-helpers';

export async function deleteComicFiles(
  r2: R2Bucket,
  comicName: string
): Promise<ApiError | undefined> {
  try {
    const files = await r2.list({
      prefix: `${comicName}/`,
    });

    for (const file of files.objects) {
      await r2.delete(file.key);
    }
  } catch (err: any) {
    return {
      logMessage: `Error deleting R2 comic files: ${err.message}`,
      context: { comicName },
      error: err,
    };
  }

  return;
}
