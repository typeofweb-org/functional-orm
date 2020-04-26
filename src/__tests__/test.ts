import 'jest-extended';
import { sql, pgp, getDbConnection } from '../db';
import {
  getTablesSchemas,
  schemaToTableObj,
  tableObjToTSCode,
  generateTSCodeForAllSchemas,
  getPostgresVersion,
} from '../generator';
import Path from 'path';
import { compileTypeScriptCode } from './tsCompiler';
import { Gostek, Op, WhereOp } from '../querybuilder/querybuilder';
import { User } from './generated/models';

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
          { printWidth: 30 },
        ),
      ).toEqual(
        `
export const User = {
  name: 'user',
  columns: {
    id: {
      type: 'int4',
      notNull: true,
    },
    name: {
      type: 'text',
      notNull: false,
    },
  },
} as const;
`.trimStart(),
      );
    });
  });
});

describe('integration tests', () => {
  const db = getDbConnection({
    user: 'test',
    database: 'test',
    password: 'test',
  });

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

  describe('generator', () => {
    it('reads postgres version', async () => {
      expect(await getPostgresVersion(db)).toBeGreaterThanOrEqual(120000);
    });

    it('correctly reads schema for table user', async () => {
      const result = await getTablesSchemas(db);

      const userSchema = result.find((i) => i.tableName === 'user');
      expect(userSchema).toBeDefined();

      expect(userSchema!.schema).toEqual([
        { column_name: 'id', is_nullable: 'NO', udt_name: 'int4' },
        { column_name: 'email', is_nullable: 'NO', udt_name: 'text' },
        { column_name: 'name', is_nullable: 'YES', udt_name: 'text' },
        { column_name: 'boolColumn', is_nullable: 'NO', udt_name: 'bool' },
        { column_name: 'charColumn', is_nullable: 'YES', udt_name: 'bpchar' },
        { column_name: 'dateColumn', is_nullable: 'YES', udt_name: 'date' },
        { column_name: 'float4Column', is_nullable: 'YES', udt_name: 'float4' },
        { column_name: 'float8Column', is_nullable: 'NO', udt_name: 'float8' },
        { column_name: 'int2Column', is_nullable: 'YES', udt_name: 'int2' },
        { column_name: 'int4Column', is_nullable: 'NO', udt_name: 'int4' },
        { column_name: 'int8Column', is_nullable: 'YES', udt_name: 'int8' },
        {
          column_name: 'numericColumn',
          is_nullable: 'NO',
          udt_name: 'numeric',
        },
        {
          column_name: 'jsonbColumn',
          is_nullable: 'NO',
          udt_name: 'jsonb',
        },
        { column_name: 'textColumn', is_nullable: 'YES', udt_name: 'text' },
        {
          column_name: 'timestampColumn',
          is_nullable: 'NO',
          udt_name: 'timestamp',
        },
        {
          column_name: 'timestamptzColumn',
          is_nullable: 'YES',
          udt_name: 'timestamptz',
        },
        {
          column_name: 'varcharColumn',
          is_nullable: 'NO',
          udt_name: 'varchar',
        },
      ]);
    });

    it('generates valid TS code for all schemas', async () => {
      const code = await generateTSCodeForAllSchemas(db);

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
    dateColumn: { type: 'date', notNull: false },
    float4Column: { type: 'float4', notNull: false },
    float8Column: { type: 'float8', notNull: true },
    int2Column: { type: 'int2', notNull: false },
    int4Column: { type: 'int4', notNull: true },
    int8Column: { type: 'int8', notNull: false },
    numericColumn: { type: 'numeric', notNull: true },
    jsonbColumn: { type: 'jsonb', notNull: true },
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

  describe('querybuilder', () => {
    it('builds queries', () => {
      expect(Gostek.from(User).select('*').getQuery()).toEqual({
        text: 'SELECT * FROM "user" ',
        values: [],
      });

      expect(Gostek.from(User).select(['id']).getQuery()).toEqual({
        text: 'SELECT "user"."id" FROM "user" ',
        values: [],
      });

      expect(
        Gostek.from(User)
          .select(['id'])
          .select('*')
          .where({ [WhereOp.$and]: [['name', Op.$eq, 'Michał']] })
          .getQuery(),
      ).toEqual({
        text: 'SELECT * FROM "user" WHERE "name" = $1',
        values: ['Michał'],
      });

      expect(
        Gostek.from(User)
          .select(['id', 'name'])
          .where({ [WhereOp.$and]: [['id', Op.$in, [1, 2, 3]]] })
          .getQuery(),
      ).toEqual({
        text:
          'SELECT "user"."id", "user"."name" FROM "user" WHERE "id" in ($1,$2,$3)',
        values: [1, 2, 3],
      });

      expect(
        Gostek.from(User)
          .select(['id', 'name'])
          .where({
            [WhereOp.$and]: [
              ['id', Op.$in, [1, 2, 3]],
              ['name', Op.$eq, 'Kasia'],
            ],
          })
          .getQuery(),
      ).toEqual({
        text:
          'SELECT "user"."id", "user"."name" FROM "user" WHERE "id" in ($1,$2,$3) AND "name" = $4',
        values: [1, 2, 3, 'Kasia'],
      });
    });

    it('can insert a full new entity to database', async () => {
      const nowWithoutTimezone = new Date('2020-04-13T22:00:00.000Z');
      nowWithoutTimezone.setMinutes(nowWithoutTimezone.getTimezoneOffset());
      const nowWithoutTimezoneDatePrecision = new Date(
        '2020-04-13T00:00:00.000Z',
      );
      nowWithoutTimezoneDatePrecision.setMinutes(
        nowWithoutTimezoneDatePrecision.getTimezoneOffset(),
      );

      const userObject = {
        id: 1,
        email: 'michal@typeofweb.com',
        name: 'Michał',
        boolColumn: false,
        charColumn: '',
        dateColumn: nowWithoutTimezone,
        float4Column: 4.5,
        float8Column: 3.14,
        int2Column: 2,
        int4Column: 11,
        int8Column: 10n,
        numericColumn: 50.5,
        jsonbColumn: {
          some: 'value',
          is: 1,
          and: ['has_array', 'of', 'values'],
          nullIsOk: null,
        },
        textColumn: 'some text',
        timestampColumn: nowWithoutTimezone,
        timestamptzColumn: new Date('2020-04-13T22:00:00.000Z'),
        varcharColumn: '',
      };

      await Gostek.to(User).insertOne(userObject).execute(db);

      expect((await Gostek.from(User).select('*').execute(db))[0]).toEqual({
        ...userObject,
        dateColumn: nowWithoutTimezoneDatePrecision,
        numericColumn: '50.5',
      });
    });

    it('can insert new entity of only required fields to database', async () => {
      const nowWithoutTimezone = new Date('2020-04-13T22:00:00.000Z');
      nowWithoutTimezone.setMinutes(nowWithoutTimezone.getTimezoneOffset());
      const nowWithoutTimezoneDatePrecision = new Date(
        '2020-04-13T00:00:00.000Z',
      );
      nowWithoutTimezoneDatePrecision.setMinutes(
        nowWithoutTimezoneDatePrecision.getTimezoneOffset(),
      );

      const userObject = {
        id: 1,
        email: 'michal@typeofweb.com',
        name: null,
        boolColumn: false,
        charColumn: null,
        dateColumn: nowWithoutTimezone,
        float4Column: null,
        float8Column: 3.14,
        int2Column: null,
        int4Column: 11,
        int8Column: null,
        numericColumn: 50.5,
        jsonbColumn: {
          some: 'value',
          is: 1,
          and: ['has_array', 'of', 'values'],
          nullIsOk: null,
        },
        textColumn: null,
        timestampColumn: nowWithoutTimezone,
        timestamptzColumn: null,
        varcharColumn: '',
      };

      await Gostek.to(User).insertOne(userObject).execute(db);

      const results = await Gostek.from(User).select('*').execute(db);
      expect(results.length).toEqual(1);
      expect(results[0]).toEqual({
        ...userObject,
        dateColumn: nowWithoutTimezoneDatePrecision,
        numericColumn: '50.5',
      });
    });

    it('runs select queries', async () => {
      const nowWithoutTimezone = new Date('2020-04-13T22:00:00.000Z');
      nowWithoutTimezone.setMinutes(nowWithoutTimezone.getTimezoneOffset());
      const one = {
        id: 1,
        email: 'michal@typeofweb.com',
        name: 'Michał',
        boolColumn: false,
        charColumn: '',
        dateColumn: null,
        float4Column: null,
        float8Column: 3.14,
        int2Column: null,
        int4Column: 11,
        int8Column: null,
        numericColumn: '50.50',
        jsonbColumn: {
          some: 'value',
          is: 1,
          and: ['has_array', 'of', 'values'],
          nullIsOk: null,
        },
        textColumn: 'some text',
        timestampColumn: nowWithoutTimezone,
        timestamptzColumn: new Date('2020-04-13T22:00:00.000Z'),
        varcharColumn: '',
      };
      const two = {
        id: 33,
        email: 'kasia@typeofweb.com',
        name: 'Kasia',
        boolColumn: false,
        charColumn: '',
        dateColumn: null,
        float4Column: null,
        float8Column: 3.14,
        int2Column: null,
        int4Column: 11,
        int8Column: null,
        numericColumn: '50.50',
        jsonbColumn: {
          some: 'value',
          is: 1,
          and: ['has_array', 'of', 'values'],
          nullIsOk: null,
        },
        textColumn: 'some text',
        timestampColumn: nowWithoutTimezone,
        timestamptzColumn: new Date('2020-04-13T22:00:00.000Z'),
        varcharColumn: '',
      };

      await db.none(`INSERT INTO "user" VALUES (
        1,
        'michal@typeofweb.com',
        'Michał',
        false,
        '',
        null,
        NULL,
        3.14,
        NULL,
        11,
        NULL,
        50.50,
        '{"some": "value", "is": 1, "and": ["has_array", "of", "values"], "nullIsOk": null}',
        'some text',
        '2020-04-13T22:00:00.000Z',
        '2020-04-13T22:00:00.000Z',
        ''
      );`);
      await db.none(`INSERT INTO "user" VALUES (
        33,
        'kasia@typeofweb.com',
        'Kasia',
        false,
        '',
        null,
        NULL,
        3.14,
        NULL,
        11,
        NULL,
        50.50,
        '{"some": "value", "is": 1, "and": ["has_array", "of", "values"], "nullIsOk": null}',
        'some text',
        '2020-04-13T22:00:00.000Z',
        '2020-04-13T22:00:00.000Z',
        ''
      );`);

      expect(await Gostek.from(User).select('*').execute(db)).toEqual([
        one,
        two,
      ]);

      expect(await Gostek.from(User).select(['id']).execute(db)).toEqual([
        { id: one.id },
        { id: two.id },
      ]);

      expect(
        await Gostek.from(User)
          .select(['id'])
          .select('*')
          .where({ [WhereOp.$and]: [['name', Op.$eq, 'Michał']] })
          .execute(db),
      ).toEqual([one]);

      expect(
        await Gostek.from(User)
          .select(['id', 'name'])
          .where({ [WhereOp.$and]: [['id', Op.$in, [1, 2, 3]]] })
          .execute(db),
      ).toEqual([{ id: one.id, name: one.name }]);

      expect(
        await Gostek.from(User)
          .select(['id', 'name'])
          .where({
            [WhereOp.$and]: [
              ['id', Op.$in, [1, 2, 3]],
              ['name', Op.$eq, 'Michał'],
            ],
          })
          .execute(db),
      ).toEqual([{ id: one.id, name: one.name }]);

      expect(
        await Gostek.from(User)
          .select(['id', 'name'])
          .where({
            [WhereOp.$or]: [
              ['id', Op.$in, [1, 2, 3]],
              ['name', Op.$eq, 1],
            ],
          })
          .execute(db),
      ).toEqual([{ id: one.id, name: one.name }]);

      expect(
        await Gostek.from(User)
          .select(['id', 'name'])
          .where({
            [WhereOp.$or]: [
              ['name', Op.$eq, 'Michał'],
              ['name', Op.$eq, 'Kasia'],
            ],
          })
          .execute(db),
      ).toEqual([
        { id: one.id, name: one.name },
        { id: two.id, name: two.name },
      ]);
    });
  });
});
