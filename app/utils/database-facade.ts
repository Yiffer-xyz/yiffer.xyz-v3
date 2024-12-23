export type DBResponse<T> =
  | {
      isError: true;
      errorMessage: string;
      queriesWithParams?: QueryWithParams[];
    }
  | {
      isError: false;
      result: T;
      errorMessage?: string;
    };

export type ExecDBResponse = {
  isError: boolean;
  errorMessage?: string;
  queriesWithParams?: QueryWithParams[];
};

export type QueryWithParams = {
  query: string;
  params?: any[];
  queryName?: string;
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
      } else {
        if (
          queriesWithParams[i]?.queryName &&
          // @ts-ignore
          queriesWithParams[i].queryName.length > 0
        ) {
          // @ts-ignore
          await processDbQueryMeta(db, 'read', queriesWithParams[i].queryName, res.meta);
        }
        results.push(res.results);
      }
    }

    return {
      isError: false,
      errorMessage: '',
      result: results as T,
    };
  } catch (err: any) {
    return {
      isError: true,
      errorMessage: `QueryDbMultiple err: ${err.message}`,
      queriesWithParams,
    };
  }
}

export async function queryDb<T>(
  db: D1Database,
  query: string,
  params?: any[] | null,
  queryName?: string
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
      if (queryName && queryName.length > 0) {
        await processDbQueryMeta(db, 'read', queryName, response.meta);
      }
      return {
        isError: false,
        result: response.results as T,
      };
    }
  } catch (err: any) {
    return {
      isError: true,
      errorMessage: err.message,
      queriesWithParams: [{ query, params: params || [] }],
    };
  }
}

export async function queryDbExec(
  db: D1Database,
  query: string,
  params: any[] = [],
  queryName?: string
): Promise<ExecDBResponse> {
  try {
    const statement = db.prepare(query).bind(...params);
    const res = await statement.run();
    if (res.error) {
      return {
        isError: true,
        errorMessage: res.error,
      };
    } else {
      if (queryName && queryName.length > 0) {
        await processDbQueryMeta(db, 'write', queryName, res.meta);
      }
      return {
        isError: false,
      };
    }
  } catch (err: any) {
    console.error(err);
    console.log({ query, params });
    return {
      isError: true,
      errorMessage: err.message,
      queriesWithParams: [{ query, params }],
    };
  }
}

async function processDbQueryMeta(
  db: D1Database,
  queryType: 'read' | 'write',
  queryName: string,
  meta: D1Response['meta']
) {
  const shouldLog = Math.random() > 0;

  const numRows = queryType === 'read' ? meta.rows_read : meta.rows_written;

  if (shouldLog) {
    const analyticsQuery = db
      .prepare(
        `INSERT INTO dbquerylogs (queryName, rowsRead, queryType, time) VALUES (?, ?, ?, ?)`
      )
      .bind(queryName, numRows, queryType, meta.duration);

    await analyticsQuery.run();
  }

  // console.log(
  //   `${numRows.toString().padStart(6)} ${meta.duration.toString().padStart(3)}  ${queryType.substring(0, 1)}  ${queryName}`
  // );
}
