import { Gostek, Op, WhereOp } from './querybuilder/querybuilder';
// tslint:disable:no-magic-numbers

const User = {
  name: 'user',
  columns: {
    id: { type: 'int4', notNull: true },
    name: { type: 'text', notNull: false },
    userData: { type: 'jsonb', notNull: true },
    int8Column: { type: 'int8', notNull: true },
  },
} as const;

async () => {
  // $ExpectError
  Gostek.from(User).select('foo');

  // $ExpectError
  Gostek.from(User)
    .select('*')
    .where({ [WhereOp.$and]: [['id', Op.$eq, null]] });

  // $ExpectError
  Gostek.from(User)
    .select(['id'])
    .where({ [WhereOp.$and]: [['id', Op.$in, null]] });

  // $ExpectError
  Gostek.to(User).select();

  // $ExpectError
  Gostek.to(User).insertOne();

  // $ExpectError
  Gostek.to(User).insertOne({ notExisting: 'field' });

  // $ExpectError
  Gostek.to(User).insertOne({ name: 1 });

  // $ExpectError
  Gostek.from(User)
    .select(['userData'])
    .where({ [WhereOp.$and]: [['userData', Op.$eq, undefined]] });

  // $ExpectError
  Gostek.from(User)
    .select(['userData'])
    .where({
      [WhereOp.$and]: [['name', Op.$eq, 'name']],
      [WhereOp.$or]: [['name', Op.$eq, 'name']],
    });

  // $ExpectError
  Gostek.from(User)
    .select(['id'])
    // $ExpectError
    .where({ [WhereOp.$and]: [['id', Op.$in, ['a', 'b', 'c']]] });

  // $ExpectType { readonly name: string | null; }[]
  await Gostek.from(User)
    .select(['name'])
    .where({ [WhereOp.$and]: [['id', Op.$in, [1, 2, 3]]] })
    .execute({} as any);

  // $ExpectType { readonly id: number; readonly name: string | null; readonly userData: Json; readonly int8Column: BigInt; }[]
  await Gostek.from(User)
    .select('*')
    .execute({} as any);
};
