import * as Sentry from "@sentry/cloudflare";

export const onRequest = [
  // Make sure Sentry is the first middleware
  Sentry.sentryPagesPlugin((context) => ({
    dsn: "https://74fe377e56b149fa9f1fa9d41d5de90b@o4504978928959488.ingest.us.sentry.io/4504978941542400",
    // Set tracesSampleRate to 1.0 to capture 100% of spans for tracing.
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 0.01,
  })),
  // Add more middlewares here
];