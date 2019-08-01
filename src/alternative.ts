import { compose } from 'ramda';
import pipe from 'ramda/es/pipe';

type Diff<T, U> = T extends U ? never : T;

/**
 * @description Model fields
 */
export type Model = {
  name: string;
  columns: {};
};

/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
type ColumnMetaData<M extends Model> = {
  type: 'TEXT' | 'DATE';
  notNull: boolean;
  // … @todo
};

/**
 * @description nominal objects which are incompatible even if structurally equivalent
 */
declare const $brand: unique symbol;
type Column<K, T extends ColumnMetaData<Model>> = T & { [$brand]: K };

/**
 * @description internal representation of a query
 */
type Query<M extends Model, C extends Column<EF, ColumnMetaData<M>>, EF extends string = string> = {
  model: M;
  columns: C[];
};

type User = Model & {
  columns: {
    id: Column<'user.id', ColumnMetaData<User>>;
    age: Column<'user.age', ColumnMetaData<User>>;
  };
};

const USER = {
  name: 'user',
  columns: {
    age: { type: 'TEXT', notNull: true },
    id: { type: 'TEXT', notNull: true },
  },
} as User;

type Invoice = Model & {
  columns: {
    id: Column<'invoice.id', ColumnMetaData<Invoice>>;
    age: Column<'invoice.age', ColumnMetaData<Invoice>>;
  };
};

const INVOICE = {
  name: 'invoice',
  columns: {
    id: { type: 'TEXT', notNull: true },
  },
} as Invoice;

/**
 *
 *
 *
 *
 */

const from = <M extends Model>(m: M): (() => Query<M, never>) => {
  // tslint:disable-next-line:no-any
  return {} as any;
};

type GetF<F, M extends Model> = F extends Column<infer R, ColumnMetaData<M>> ? R : never;

// const select = <M extends Model>(
//   f: Column<any, ColumnMetaData<M>>
// ): (<EF extends Column<any, ColumnMetaData<M>>>(
//   q: Query<M, EF>
// ) => Query<M, GetF<typeof f, M> | EF>) => {
//   // tslint:disable-next-line:no-any
//   return {} as any;
// };

const select = <M extends Model, K1 extends string>(
  f: Column<K1, ColumnMetaData<M>>,
): (<K2 extends string, EF extends Column<K2, ColumnMetaData<M>>>(
  q: Query<M, EF>,
) => Query<M, Column<K1, EF | ColumnMetaData<M>>>) => {
  // tslint:disable-next-line:no-any
  return {} as any;
};

const r1 = from(USER);

const r12 = select(USER.columns.id);

const r2 = select(USER.columns.id)(from(USER)());

const r2b = select(USER.columns.age)(from(USER)());

const r3 = select(USER.columns.age)(select(USER.columns.id)(from(USER)()));

const execute1 = pipe(
  from(USER),
  select(USER.columns.id),
  select(USER.columns.age),
);

const execute2 = pipe(
  from(INVOICE),
  select(INVOICE.columns.id),
  select(INVOICE.columns.age),
);
