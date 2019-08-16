import PgPromise, { QueryFile } from 'pg-promise';
import Path from 'path';

export const pgp = PgPromise();

export const db = pgp({
  user: 'test',
  database: 'test',
  password: 'test',
});

const sqlCache = new Map<string, QueryFile>();

export function sql(file: string) {
  const fullPath = Path.join(__dirname, file);
  if (sqlCache.has(fullPath)) {
    return sqlCache.get(fullPath) as QueryFile;
  }

  const queryFile = new QueryFile(fullPath, { minify: true });
  sqlCache.set(fullPath, queryFile);

  return queryFile;
}
