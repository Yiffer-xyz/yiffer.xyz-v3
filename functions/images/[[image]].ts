interface Env {
  COMICS_BUCKET: R2Bucket;
}

// TODO: Eventually, access control etc
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
