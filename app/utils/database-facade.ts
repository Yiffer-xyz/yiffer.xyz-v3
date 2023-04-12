export interface DBResponse<T> {
  errorMessage: string;
  errorCode?: string;
  result?: T;
  sql?: string;
  insertId?: number;
}

export async function queryDb<T>(
  urlBase: string,
  query: string,
  params: any[] = []
): Promise<DBResponse<T>> {
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
