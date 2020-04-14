import PgPromise, { QueryFile } from 'pg-promise';

export const pgp = PgPromise();

type ConnectionOptions =
  | {
      connectionString: string;
    }
  | {
      host?: string;
      database: string;
      user: string;
      password: string;
      port?: number;
    };

export const getDbConnection = (options: ConnectionOptions) => {
  return pgp(options);
};

const sqlCache = new Map<string, QueryFile>();

export function sql(fullPath: string) {
  if (sqlCache.has(fullPath)) {
    return sqlCache.get(fullPath) as QueryFile;
  }

  const queryFile = new QueryFile(fullPath, { minify: true });
  sqlCache.set(fullPath, queryFile);

  return queryFile;
}
