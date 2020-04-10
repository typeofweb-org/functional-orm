import 'jest-extended';
import fc from 'fast-check';
import { db, sql, pgp } from '../generator/db';
import { getTablesSchemas, schemaToObj, tableToTSCode } from '../generator';
import Path from 'path';

const contains = (pattern: string, text: string) => text.includes(pattern);

describe('unit tests', () => {
  describe('schemaToObj', () => {
    it('should generate schema object', () => {
      const result = schemaToObj({
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
      const result = schemaToObj({
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

  describe('tableToTSCode', () => {
    it('should generate valid TS code', () => {
      expect(
        tableToTSCode({
          name: 'user',
          columns: {
            id: { type: 'int4', notNull: true },
            name: { type: 'text', notNull: false },
          },
        }),
      ).toEqual(
        `
 const User = {
  name: 'user',
  columns: { id: { type: 'int4', notNull: true }, name: { type: 'text', notNull: false } },
} as const;
`.trimLeft(),
      );
    });

    it('should allow passing formatting options to meet your style', () => {
      expect(
        tableToTSCode(
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
const User = {
	name: 'user',
	columns: {
		id: { type: 'int4', notNull: true },
		name: { type: 'text', notNull: false },
	},
} as const;
`.trimLeft(),
      );
    });
  });
});

describe('integration tests', () => {
  beforeAll(() => db.none(sql(Path.join(__dirname, 'drop_user.sql'))));
  beforeEach(() => db.none(sql(Path.join(__dirname, 'create_user.sql'))));

  afterEach(async () => {
    await db.none(sql(Path.join(__dirname, 'drop_user.sql')));
  });

  afterAll(() => pgp.end());

  it('should work', () => {
    expect(1).toBe(1);

    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
        expect(contains(b, a + b + c)).toBe(true);
      }),
    );
  });

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
});
