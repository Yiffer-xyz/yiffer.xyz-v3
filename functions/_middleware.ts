import sentryPlugin from '@cloudflare/pages-plugin-sentry';

// TODO: I don't think this works? Look into it?
export const onRequest: PagesFunction<{
  SENTRY_DSN: string;
}> = context => {
  return sentryPlugin({ dsn: context.env.SENTRY_DSN })(context);
};
