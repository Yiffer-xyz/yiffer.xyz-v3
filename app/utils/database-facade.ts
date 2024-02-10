export type DBResponse<T> =
  | {
      isError: true;
      errorMessage: string;
    }
  | {
      isError: false;
      result: T;
      errorMessage?: string;
    };

export type ExecDBResponse = {
  isError: boolean;
  errorMessage?: string;
};

export type QueryWithParams = {
  query: string;
  params?: any[];
};

// T should be an array with the responses expected in order
export async function queryDbMultiple<T>(
  db: D1Database,
  queriesWithParams: QueryWithParams[]
): Promise<DBResponse<T>> {
  try {
    const statements = queriesWithParams.map(query => {
      let statement: D1PreparedStatement;
      if (query.params && query.params.length) {
        statement = db.prepare(query.query).bind(...query.params);
      } else {
        statement = db.prepare(query.query);
      }

      return statement;
    });

    const responses = await db.batch(statements);
    const results: any[] = [];
    for (let i = 0; i < responses.length; i++) {
      const res = responses[i];
      if (res.error) {
        return {
          isError: true,
          errorMessage: `QueryDbMultiple caught err in statement #${i + 1}: ${res.error}`,
        };
      }
      results.push(res.results);
    }

    return {
      isError: false,
      errorMessage: '',
      result: results as T,
    };
  } catch (err: any) {
    console.error(err);
    console.log(queriesWithParams);
    return {
      isError: true,
      errorMessage: `QueryDbMultiple err: ${err.message}`,
    };
  }
}

export async function queryDb<T>(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<DBResponse<T>> {
  try {
    let statement: D1PreparedStatement;
    if (params && params.length) {
      statement = db.prepare(query).bind(...params);
    } else {
      statement = db.prepare(query);
    }

    const response = await statement.all();

    if (response.error) {
      return {
        isError: true,
        errorMessage: response.error,
      };
    } else {
      return {
        isError: false,
        result: response.results as T,
      };
    }
  } catch (err: any) {
    console.error(err);
    console.log({ query, params });
    return {
      isError: true,
      errorMessage: err.message,
    };
  }
}

export async function queryDbExec(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<ExecDBResponse> {
  try {
    const statement = db.prepare(query).bind(...params);
    await statement.all();
    return {
      isError: false,
    };
  } catch (err: any) {
    console.error(err);
    console.log({ query, params });
    return {
      isError: true,
      errorMessage: err.message,
    };
  }
}
