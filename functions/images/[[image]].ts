// This is not in use. It was an attempt at doing pages via R2, which
// didn't end up working as well as intended. Leaving it here as an
// example of how to to R2 with functions, however.

interface Env {
  COMICS_BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async context => {
  const imagePath = context.functionPath.replace('/images/', '').replace('%20', ' ');
  const r2Obj = await context.env.COMICS_BUCKET.get(imagePath);

  if (!r2Obj) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(r2Obj.body, {
    headers: {
      'Content-Type': 'image/jpeg',
    },
  });
};
