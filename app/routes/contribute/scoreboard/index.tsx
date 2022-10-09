import BackToContribute from '../BackToContribute';

export default function Upload() {
  return (
    <div className="container mx-auto">
      <h1>Contributions scoreboard</h1>
      <p className="mb-4">
        <BackToContribute />
      </p>

      <p>
        See the imported code for the mocked responses to the database queries for month and year to
        use.
      </p>
    </div>
  );
}
