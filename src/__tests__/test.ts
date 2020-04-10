import 'jest-extended';
import { db, sql, pgp } from '../generator/db';
import {
  getTablesSchemas,
  schemaToTableObj,
  tableObjToTSCode,
  generateTSCodeForAllSchema as generateTSCodeForAllSchemas,
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
  };
  beforeAll(drop);
  beforeEach(create);
  afterEach(drop);
  afterAll(() => pgp.end());

  it('correctly reads schema for table user', async () => {
    const result = await getTablesSchemas();

    const userSchema = result.find((i) => i.tableName === 'user');
    expect(userSchema).toBeDefined();

    expect(userSchema!.schema).toIncludeSameMembers([
      { column_name: 'id', udt_name: 'int4', is_nullable: 'NO' },
      { column_name: 'email', udt_name: 'text', is_nullable: 'NO' },
      { column_name: 'name', udt_name: 'text', is_nullable: 'YES' },
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
  },
} as const;
`.trimLeft(),
    );

    const compiled = compileTypeScriptCode(code);
    expect(compiled.errors).toHaveLength(0);
  });
});
