import { db, Op } from './index';
// tslint:disable:no-magic-numbers

const User = {
  name: 'user',
  columns: {
    age: { type: 'text', notNull: false },
    id: { type: 'int4', notNull: true },
  },
} as const;

// const Invoice = {
//   name: 'invoice',
//   columns: {
//     id: { type: 'TINYINT', notNull: true },
//     age: { type: 'TEXT', notNull: true },
//   },
// } as const;

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

  // $ExpectType { readonly age: string | null; }[]
  await db
    .from(User)
    .select(['age'])
    .where(['id', Op.$in, [1, 2, 3]])
    .execute();

  // $ExpectType { readonly age: string | null; readonly id: number; }[]
  await db.from(User).select('*').execute();
};
