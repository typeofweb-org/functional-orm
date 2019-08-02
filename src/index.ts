// tslint:disable:no-magic-numbers
import pipe from 'ramda/es/pipe';

/**
 * @description Model fields
 */
export type Model = {
  name: string;
};

/**
 * @description Types of columns which are mappable to JS
 */
type ColumnMetaDataType = 'TEXT' | 'DATE' | 'TINYINT';

/**
 * @description Convert SQL column string literal type to JavaScript type
 */
type GetJSTypeFromSqlType<T extends ColumnMetaDataType> = T extends 'TEXT'
  ? string
  : (T extends 'DATE' ? Date : (T extends 'TINYINT' ? number : never));

/**
 * @description Infers SQL column string literal type of a column
 */
// tslint:disable-next-line:no-any
type GetSQLTypeOfColumn<C> = C extends Column<any, ColumnMetaData<any, infer R>> ? R : never;

/**
 * @description Gets JavaScript type of a column
 */
type GetJSTypeOfColumn<C> = GetJSTypeFromSqlType<GetSQLTypeOfColumn<C>>;

/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
// tslint:disable-next-line:no-any
export type ColumnMetaData<M extends Model, Type extends ColumnMetaDataType = any> = {
  type: Type;
  notNull: boolean;
  // … @todo
};

/**
 * @description nominal objects which are incompatible even if structurally equivalent
 */
declare const $brand: unique symbol;
export type Column<K, T extends ColumnMetaData<Model>> = T & { [$brand]: K };

/**
 * @description internal representation of a query
 */
export type Query<
  M extends Model,
  Columns extends Column<EF, ColumnMetaData<M>> = never,
  Where = never,
  EF extends string = string
> = {
  model: M;
  columns: Columns[];
};

const $eq = Symbol('$eq');
const $neq = Symbol('$neq');
export type Operators = typeof $eq | typeof $neq;
export const Op = {
  $eq: $eq as typeof $eq,
  $neq: $neq as typeof $neq,
};

/**
 *
 *
 *
 *
 */

export const from = <M extends Model>(m: M): (() => Query<M>) => {
  // tslint:disable-next-line:no-any
  return {} as any;
};

export const select = <M extends Model, K1 extends string>(
  f: Column<K1, ColumnMetaData<M>>,
): (<K2 extends string, ExistingColumns extends Column<K2, ColumnMetaData<M>>>(
  q: Query<M, ExistingColumns>,
) => Query<M, ExistingColumns | Column<K1, ColumnMetaData<M>>>) => {
  // tslint:disable-next-line:no-any
  return {} as any;
};

/**
 *
 */

type User = Model & {
  columns: {
    id: Column<'user.id', ColumnMetaData<User, 'TINYINT'>>;
    age: Column<'user.age', ColumnMetaData<User, 'TEXT'>>;
  };
};

const USER = {
  name: 'user',
  columns: {
    age: { type: 'TEXT', notNull: true },
    id: { type: 'TINYINT', notNull: true },
  },
} as User;

type Invoice = Model & {
  columns: {
    id: Column<'invoice.id', ColumnMetaData<Invoice, 'TINYINT'>>;
    age: Column<'invoice.age', ColumnMetaData<Invoice, 'TEXT'>>;
  };
};

const INVOICE = {
  name: 'invoice',
  columns: {
    id: { type: 'TINYINT', notNull: true },
    age: { type: 'TEXT', notNull: true },
  },
} as Invoice;

export const where = <
  M extends Model,
  CMD extends ColumnMetaData<M>,
  K1 extends string,
  C extends Column<K1, CMD>
>(
  args: [C, Operators, GetJSTypeOfColumn<C>],
): (<K2 extends string, ExistingColumns extends Column<K2, ColumnMetaData<M>>>(
  q: Query<M, ExistingColumns>,
) => Query<M, Column<K1, ExistingColumns>>) => {
  // tslint:disable-next-line:no-any
  return {} as any;
};

const execute3 = pipe(
  from(USER),
  select(USER.columns.id),
  select(USER.columns.age),
  where([USER.columns.id, $eq, 12]),
);
