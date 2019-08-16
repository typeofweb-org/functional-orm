import { db, sql } from './db';
import { ColumnSchema, TableName } from './types';

function getTableNames(): Promise<TableName[]> {
  return db.manyOrNone(sql('select_table_name.sql'));
}

function getTableSchema(tableName: string): Promise<ColumnSchema[]> {
  return db.manyOrNone(sql('select_table_schema.sql'), [tableName]);
}

async function getTablesSchemas(): Promise<
  Array<{
    tableName: string;
    schema: ColumnSchema[];
  }>
> {
  const tableNames = await getTableNames();

  const result = await Promise.all(
    tableNames.map(async i => {
      return { tableName: i.table_name, schema: await getTableSchema(i.table_name) };
    }),
  );

  return result;
}

export async function run() {
  return getTablesSchemas();
}
