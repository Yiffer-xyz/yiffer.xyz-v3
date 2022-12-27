export function ErrorBoundary({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong in this beloved admin panel of ours :( aaaa</p>
      <pre className="mt-4 p-4 bg-theme1-primaryTrans">
        <code>{error.message}</code>
      </pre>
    </div>
  );
}
