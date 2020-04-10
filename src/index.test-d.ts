import { db, Op } from './index';
// tslint:disable:no-magic-numbers

const User = {
  name: 'user',
  columns: {
    id: { type: 'int4', notNull: true },
    name: { type: 'text', notNull: false },
  },
} as const;

async () => {
  // $ExpectError
  db.from(User).select('foo');

  // $ExpectError
  db.from(User).select('*').where(['id', Op.$eq, null]);

  // $ExpectError
  db.from(User).select(['id']).where(['id', Op.$in, null]);

  db.from(User)
    .select(['id'])
    // $ExpectError
    .where(['id', Op.$in, ['a', 'b', 'c']]);

  // $ExpectType { readonly name: string | null; }[]
  await db
    .from(User)
    .select(['name'])
    .where(['id', Op.$in, [1, 2, 3]])
    .execute();

  // $ExpectType { readonly name: string | null; readonly id: number; }[]
  await db.from(User).select('*').execute();
};
