import { db, sql } from './db';
import { ColumnSchema, TableName, TableSchema } from './types';
import Path from 'path';
import { Table } from '..';
import Prettier from 'prettier';
import { defaults } from 'lodash';

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class NotSupportedError extends Error {
  message = 'NotSupportedError';
}

function getTableNames(): Promise<TableName[]> {
  return db.manyOrNone(sql(Path.join(__dirname, 'select_table_name.sql')));
}

function getColumnSchemas(tableName: string): Promise<ColumnSchema[]> {
  return db.manyOrNone(sql(Path.join(__dirname, 'select_table_schema.sql')), [tableName]);
}

export async function getTablesSchemas(): Promise<Array<TableSchema>> {
  const tableNames = await getTableNames();

  const result = await Promise.all(
    tableNames.map(async (i) => {
      return { tableName: i.table_name, schema: await getColumnSchemas(i.table_name) };
    }),
  );

  return result;
}

export function schemaToTableObj(schema: TableSchema): Table {
  return {
    name: schema.tableName,
    columns: Object.fromEntries(
      schema.schema.map((s) => {
        return [s.column_name, { type: s.udt_name, notNull: s.is_nullable === 'NO' }];
      }),
    ),
  };
}

export function tableObjToTSCode(table: Table, opts?: Prettier.Options): string {
  const typeName = table.name.slice(0, 1).toLocaleUpperCase() + table.name.slice(1);
  const code = `export const ${typeName} = ${JSON.stringify(table)} as const;`;

  const defaultOptions: Prettier.Options = {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
  } as const;
  const options = defaults({}, opts, defaultOptions);
  return Prettier.format(code, {
    ...options,
    parser: 'typescript',
  });
}

export async function generateTSCodeForAllSchema() {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const schemas = await getTablesSchemas();
  const allModelsCode = schemas
    .map(schemaToTableObj)
    .map((obj) => tableObjToTSCode(obj))
    .join('\n');

  return `
/**
 * AUTOMATICALLY GENERATED
 * DO NOT MODIFY
 * ANY CHANGES WILL BE OVERWRITTEN
 */

${allModelsCode}`.trimStart();
}
