import 'jest-extended';
import { db, sql, pgp } from '../generator/db';
import {
  getTablesSchemas,
  schemaToTableObj,
  tableObjToTSCode,
  generateTSCodeForAllSchemas,
  getPostgresVersion,
} from '../generator';
import Path from 'path';
import { compileTypeScriptCode } from './tsCompiler';

describe('unit tests', () => {
  describe('schemaToTableObj', () => {
    it('should generate schema object', () => {
      const result = schemaToTableObj({
        tableName: 'user',
        schema: [
          {
            column_name: 'id',
            udt_name: 'int4',
            is_nullable: 'NO',
          },
        ],
      });

      expect(result).toEqual({
        name: 'user',
        columns: {
          id: { type: 'int4', notNull: true },
        },
      });
    });

    it('should handle nullable columns', () => {
      const result = schemaToTableObj({
        tableName: 'user',
        schema: [
          {
            column_name: 'id',
            udt_name: 'int4',
            is_nullable: 'NO',
          },
          {
            column_name: 'name',
            udt_name: 'text',
            is_nullable: 'YES',
          },
        ],
      });

      expect(result).toEqual({
        name: 'user',
        columns: {
          id: { type: 'int4', notNull: true },
          name: { type: 'text', notNull: false },
        },
      });
    });
  });

  describe('tableObjToTSCode', () => {
    it('should generate valid TS code', () => {
      expect(
        tableObjToTSCode({
          name: 'user',
          columns: {
            id: { type: 'int4', notNull: true },
            name: { type: 'text', notNull: false },
          },
        }),
      ).toEqual(
        `
export const User = {
  name: 'user',
  columns: { id: { type: 'int4', notNull: true }, name: { type: 'text', notNull: false } },
} as const;
`.trimStart(),
      );
    });

    it('should allow passing formatting options to meet your style', () => {
      expect(
        tableObjToTSCode(
          {
            name: 'user',
            columns: {
              id: { type: 'int4', notNull: true },
              name: { type: 'text', notNull: false },
            },
          },
          { printWidth: 80, useTabs: true },
        ),
      ).toEqual(
        `
export const User = {
	name: 'user',
	columns: {
		id: { type: 'int4', notNull: true },
		name: { type: 'text', notNull: false },
	},
} as const;
`.trimStart(),
      );
    });
  });
});

describe('integration tests', () => {
  const drop = async () => {
    await db.none(sql(Path.join(__dirname, 'drop_user.sql')));
    await db.none(sql(Path.join(__dirname, 'drop_invoice.sql')));
  };
  const create = async () => {
    await db.none(sql(Path.join(__dirname, 'create_user.sql')));
    await db.none(sql(Path.join(__dirname, 'create_invoice.sql')));
    // const x = await db.one('SELECT * FROM "user";');
    // console.log(x, typeof x.editTime);
  };
  beforeAll(drop);
  beforeEach(create);
  afterEach(drop);
  afterAll(() => pgp.end());

  it('reads postgres version', async () => {
    expect(await getPostgresVersion()).toBeGreaterThanOrEqual(120000);
  });

  it('correctly reads schema for table user', async () => {
    const result = await getTablesSchemas();

    const userSchema = result.find((i) => i.tableName === 'user');
    expect(userSchema).toBeDefined();

    expect(userSchema!.schema).toIncludeSameMembers([
      { column_name: 'id', is_nullable: 'NO', udt_name: 'int4' },
      { column_name: 'email', is_nullable: 'NO', udt_name: 'text' },
      { column_name: 'name', is_nullable: 'YES', udt_name: 'text' },
      { column_name: 'boolColumn', is_nullable: 'NO', udt_name: 'bool' },
      { column_name: 'charColumn', is_nullable: 'YES', udt_name: 'bpchar' },
      { column_name: 'dateColumn', is_nullable: 'NO', udt_name: 'date' },
      { column_name: 'float4Column', is_nullable: 'YES', udt_name: 'float4' },
      { column_name: 'float8Column', is_nullable: 'NO', udt_name: 'float8' },
      { column_name: 'int2Column', is_nullable: 'YES', udt_name: 'int2' },
      { column_name: 'int4Column', is_nullable: 'NO', udt_name: 'int4' },
      { column_name: 'int8Column', is_nullable: 'YES', udt_name: 'int8' },
      { column_name: 'numericColumn', is_nullable: 'NO', udt_name: 'numeric' },
      { column_name: 'textColumn', is_nullable: 'YES', udt_name: 'text' },
      { column_name: 'timestampColumn', is_nullable: 'NO', udt_name: 'timestamp' },
      { column_name: 'timestamptzColumn', is_nullable: 'YES', udt_name: 'timestamptz' },
      { column_name: 'varcharColumn', is_nullable: 'NO', udt_name: 'varchar' },
    ]);
  });

  it('generates valid TS code for all schemas', async () => {
    const code = await generateTSCodeForAllSchemas();

    expect(code).toEqual(
      `
/**
 * AUTOMATICALLY GENERATED
 * DO NOT MODIFY
 * ANY CHANGES WILL BE OVERWRITTEN
 */

export const Invoice = {
  name: 'invoice',
  columns: {
    id: { type: 'int4', notNull: true },
    value: { type: 'float4', notNull: true },
    addedAt: { type: 'date', notNull: true },
  },
} as const;

export const User = {
  name: 'user',
  columns: {
    id: { type: 'int4', notNull: true },
    email: { type: 'text', notNull: true },
    name: { type: 'text', notNull: false },
    boolColumn: { type: 'bool', notNull: true },
    charColumn: { type: 'bpchar', notNull: false },
    dateColumn: { type: 'date', notNull: true },
    float4Column: { type: 'float4', notNull: false },
    float8Column: { type: 'float8', notNull: true },
    int2Column: { type: 'int2', notNull: false },
    int4Column: { type: 'int4', notNull: true },
    int8Column: { type: 'int8', notNull: false },
    numericColumn: { type: 'numeric', notNull: true },
    textColumn: { type: 'text', notNull: false },
    timestampColumn: { type: 'timestamp', notNull: true },
    timestamptzColumn: { type: 'timestamptz', notNull: false },
    varcharColumn: { type: 'varchar', notNull: true },
  },
} as const;
`.trimLeft(),
    );

    const compiled = compileTypeScriptCode(code);
    expect(compiled.errors).toHaveLength(0);
  });
});
