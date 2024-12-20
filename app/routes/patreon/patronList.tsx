import { useEffect, useState } from 'react';

type Patron = {
  name: string;
  tier: number;
  lifetimePledge: number;
};

type PatronList = { tier: number; patrons: Patron[] }[];

export default function PatronList({ IMAGES_SERVER_URL }: { IMAGES_SERVER_URL: string }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [patronList, setPatronList] = useState<PatronList | undefined>();

  async function getPatronList() {
    const patronListRes = await fetch(`${IMAGES_SERVER_URL}/patrons`);
    if (patronListRes.ok) {
      const patronListData = await patronListRes.json();
      setPatronList(patronListData as PatronList);
    } else {
      setIsError(true);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getPatronList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IMAGES_SERVER_URL]);

  return (
    <>
      <h2 className="mt-6">Patrons</h2>
      <p className="mb-2">Thank you again, patrons, from the bottom of our hearts ❤️</p>
      {isLoading && <div>Loading patron list...</div>}
      {isError && <div>Error loading patron list</div>}

      {patronList && (
        <div className="flex flex-col md:flex-row flex-wrap gap-8">
          {patronList.map(patronList => (
            <div key={patronList.tier}>
              <h4>${patronList.tier} patrons</h4>
              <div className="flex flex-col gap-y-1">
                {patronList.patrons.map(patron => (
                  <p key={patron.name}>{getPatronText(patron)}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function getPatronText(patron: Patron) {
  // if (patron.lifetimePledge > patron.tier) {
  //   return `${patron.name} (lifetime: $${Math.round(patron.lifetimePledge)})`;
  // }
  return `${patron.name}`;
}
