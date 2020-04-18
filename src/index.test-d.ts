import { Gostek, Op } from './querybuilder/querybuilder';
// tslint:disable:no-magic-numbers

const User = {
  name: 'user',
  columns: {
    id: { type: 'int4', notNull: true },
    name: { type: 'text', notNull: false },
    userData: { type: 'jsonb', notNull: true },
  },
} as const;

async () => {
  // $ExpectError
  Gostek.from(User).select('foo');

  // $ExpectError
  Gostek.from(User).select('*').where(['id', Op.$eq, null]);

  // $ExpectError
  Gostek.from(User).select(['id']).where(['id', Op.$in, null]);

  // $ExpectError
  Gostek.to(User).select();

  // $ExpectError
  Gostek.to(User).insertOne();

  // $ExpectError
  Gostek.from(User).select(['userData']).where(['userData', Op.$eq, undefined]);

  Gostek.from(User)
    .select(['id'])
    // $ExpectError
    .where(['id', Op.$in, ['a', 'b', 'c']]);

  // $ExpectType { readonly name: string | null; }[]
  await Gostek.from(User)
    .select(['name'])
    .where(['id', Op.$in, [1, 2, 3]])
    .execute({} as any);

  // $ExpectType { readonly id: number; readonly name: string | null; readonly userData: string | number | boolean | Json[] | Pretty<{ [prop: string]: Json; }> | null; }[]
  await Gostek.from(User)
    .select('*')
    .execute({} as any);
};
