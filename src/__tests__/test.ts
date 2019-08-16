import 'jest-extended';
import fc from 'fast-check';
import { db, sql, pgp } from './db';
import { run } from '../generator';

const contains = (pattern: string, text: string) => text.indexOf(pattern) !== -1;

describe('test', () => {
  beforeAll(() => db.none(sql('drop_user.sql')));
  beforeEach(() => db.none(sql('create_user.sql')));

  afterEach(async () => {
    await db.none(sql('drop_user.sql'));
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
    const result = await run();

    const userSchema = result.find(i => i.tableName === 'user');
    expect(userSchema).toBeDefined();

    expect(userSchema!.schema).toIncludeSameMembers([
      { column_name: 'id', udt_name: 'int4', is_nullable: 'NO' },
      { column_name: 'email', udt_name: 'text', is_nullable: 'NO' },
      { column_name: 'name', udt_name: 'text', is_nullable: 'YES' },
    ]);
  });
});
