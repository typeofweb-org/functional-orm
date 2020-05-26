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
  // @ts-expect-error
  Gostek.from(User).select('foo');

  Gostek.from(User)
    .select('*')
    // @ts-expect-error
    .where({ [WhereOp.$and]: [['id', Op.$eq, null]] });

  Gostek.from(User)
    .select(['id'])
    // @ts-expect-error
    .where({ [WhereOp.$and]: [['id', Op.$in, null]] });

  // @ts-expect-error
  Gostek.to(User).select();

  // @ts-expect-error
  Gostek.to(User).insertOne();

  // @ts-expect-error
  Gostek.to(User).insertOne({ notExisting: 'field' });

  // @ts-expect-error
  Gostek.to(User).insertOne({ name: 1 });

  Gostek.from(User)
    .select(['userData'])
    // @ts-expect-error
    .where({ [WhereOp.$and]: [['userData', Op.$eq, undefined]] });

  Gostek.from(User)
    .select(['userData'])
    .where({
      // @ts-expect-error
      [WhereOp.$and]: [['name', Op.$eq, 'name']],
      // @ts-expect-error
      [WhereOp.$or]: [['name', Op.$eq, 'name']],
    });

  Gostek.from(User)
    .select(['id'])
    .where({
      // @ts-expect-error
      [WhereOp.$and]: [['id', Op.$in, ['a', 'b', 'c']]],
    });

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
