export async function renameR2File(r2: R2Bucket, oldKey: string, newKey: string) {
  const file = await r2.get(oldKey);
  if (!file) return;
  await r2.put(newKey, file.body);
  await r2.delete(oldKey);
}
