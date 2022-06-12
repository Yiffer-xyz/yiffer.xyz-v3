export default function Index() {
  return (
    <div style={{ lineHeight: '1.4' }}>
      <h1 className="text-3xl font-bold underline bg-gray-300">Welcome to Remix</h1>
      <ul>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/jokes" rel="noreferrer">
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docss
          </a>
        </li>
      </ul>
    </div>
  );
}
