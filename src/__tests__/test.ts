import fc from 'fast-check';
import { db, sql, pgp } from './db';

const contains = (pattern: string, text: string) => text.indexOf(pattern) !== -1;

describe('test', () => {
  beforeAll(() => db.none(sql('drop_user.sql')));
  beforeEach(() => db.none(sql('create_user.sql')));

  beforeEach(async () => {
    const res = await db.many('SELECT * FROM "user";');
    console.log(res);
  });

  afterEach(async () => {
    await db.none(sql('drop_user.sql'));
    await pgp.end();
  });

  it('should work', () => {
    expect(1).toBe(1);

    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
        expect(contains(b, a + b + c)).toBe(true);
      }),
    );
  });
});
