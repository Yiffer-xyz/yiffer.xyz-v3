export interface DBResponse<T> {
  errorMessage?: string;
  errorCode?: string;
  result?: T;
  insertId?: number;
}

// This one throws if there's an error instead of returning DBResponse
export async function queryDbDirect<T>(
  urlBase: string,
  query: string,
  params: any[] = []
): Promise<T> {
  const result = await queryDb<T>(urlBase, query, params);
  if (result.errorCode && result.errorMessage) {
    throw new Error(
      `Error querying database: ${result.errorCode} - ${result.errorMessage}`
    );
  }
  if (result.errorMessage) {
    throw new Error(`Error querying database: ${result.errorMessage}`);
  }
  if (result.result === undefined) {
    throw new Error('Error querying database: Undefined result');
  }

  return result.result;
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
