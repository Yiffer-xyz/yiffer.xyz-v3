export type DBResponse<T> =
  | {
      isError: true;
      errorMessage: string;
      errorCode?: string;
    }
  | {
      isError: false;
      errorMessage: string;
      errorCode?: string;
      result: T;
      sql: string;
      insertId?: number;
    };

// T should be an array with the responses expected in order
export async function queryDbMultiple<T>(
  urlBase: string,
  queries: { query: string; params?: any[] }[]
): Promise<DBResponse<T>> {
  const response = await fetch(`${urlBase}/new-api/query-db-multiple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queries),
  });

  if (!response.ok) {
    return {
      isError: true,
      errorMessage: 'Error connecting to server',
    };
  } else {
    const responseContent = await response.json();
    return responseContent as DBResponse<T>;
  }
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
    return {
      isError: true,
      errorMessage: 'Error connecting to server',
    };
  } else {
    const responseContent = await response.json();
    return responseContent as DBResponse<T>;
  }
}
