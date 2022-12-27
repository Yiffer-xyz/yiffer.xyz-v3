// NOTE: TODO: This was an idea, and then D1 became open.
// Not needed, but keeping it around juuuust in case for now..

export interface DBResponse<T> {
  errorMessage?: string;
  errorCode?: string;
  result?: T;
  insertId?: number;
}

export default async function queryDb<T>(
  urlBase: string,
  query: string,
  params: any[] = []
): Promise<DBResponse<T>> {
  console.log('url base', urlBase);
  const response = await fetch(`${urlBase}/new-api/query-db`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      params,
    }),
  });

  if (!response.ok) {
    console.error('DEV ERROR DB CALL: ', response);
    return {
      errorMessage: 'Error connecting to server',
    };
  } else {
    const responseContent = await response.json();
    return responseContent as DBResponse<T>;
  }
}
