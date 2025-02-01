import type { Patron } from '~/types/types';

export default function PatronList({
  patronTiers,
}: {
  patronTiers: { [key: number]: Patron[] };
}) {
  const sortedTiers = Object.keys(patronTiers)
    .sort((a, b) => Number(b) - Number(a))
    .map(x => Number(x));

  return (
    <>
      <h2 className="mt-4">Patrons</h2>

      {Object.keys(patronTiers).length > 0 ? (
        <>
          <p className="mb-2">
            Thank you again, patrons, from the bottom of our hearts ❤️
          </p>
          <div className="flex flex-col md:flex-row flex-wrap gap-8">
            {sortedTiers.map(tier => (
              <div key={tier}>
                <h4>${tier} patrons</h4>
                <div className="flex flex-col gap-y-1">
                  {patronTiers[tier].map(patron => (
                    <p key={patron.username}>{getPatronText(patron)}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mb-2">No patrons have linked their accounts yet.</p>
      )}
    </>
  );
}

function getPatronText(patron: Patron) {
  return `${patron.username}`;
}
