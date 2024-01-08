// THIS IS ONLY FOR LOCAL DEV. IN PROD, NOTHING POINTS TO /images,
// IT'S HANDLED BY CLOUDFLARE AND USING static.testyiffer.xyz.

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
