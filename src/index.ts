// tslint:disable:no-magic-numbers
// tslint:disable:no-any
import pipe from 'ramda/es/pipe';

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((
  k: infer I,
) => void)
  ? I
  : never;

/**
 * @description Model fields
 */
export type Model = {
  name: string;
  columns: Record<any, any>;
};

/**
 * @description Types of columns which are mappable to JS
 */
type ColumnMetaDataType = 'TEXT' | 'DATE' | 'TINYINT';

/**
 * @description Convert SQL column string literal type to JavaScript type
 */
type GetJSTypeFromSqlType<T extends ColumnMetaDataType> = {
  DATE: Date;
  TEXT: string;
  TINYINT: number;
}[T];

/**
 * @description Infers SQL column string literal type of a column
 */
type GetSQLTypeOfColumn<C> = C extends Column<any, any, ColumnMetaData<any, infer R>> ? R : never;

/**
 * @description Gets JavaScript type of a column
 */
type GetJSTypeOfColumn<C> = GetJSTypeFromSqlType<GetSQLTypeOfColumn<C>>;

/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
export type ColumnMetaData<M extends Model, Type extends ColumnMetaDataType = any> = {
  type: Type;
  notNull: boolean;
  // … @todo
};

/**
 * @description nominal objects which are incompatible even if structurally equivalent
 */
declare const $brand: unique symbol;
export type Column<K, Name extends string, T extends ColumnMetaData<Model>> = T & { [$brand]: K };

/**
 * @description internal representation of a query
 */
export type Query<
  M extends Model,
  Columns extends Column<EF, Name, ColumnMetaData<M>> = never,
  Where = never,
  EF extends string = string,
  Name extends string = string
> = {
  model: M;
  columns: Columns[];
};

const $eq = Symbol('$eq');
const $neq = Symbol('$neq');
const $in = Symbol('$in');

export type Operators = typeof $eq | typeof $neq | typeof $in;
export const Op = {
  $eq: $eq as typeof $eq,
  $neq: $neq as typeof $neq,
  $in: $in as typeof $in,
};

type OperandTypeForOperator<
  O extends Operators,
  T extends GetJSTypeFromSqlType<ColumnMetaDataType>
> = {
  [$eq]: T;
  [$neq]: T;
  [$in]: T[];
}[O];

/**
 *
 *
 *
 *
 */

export const from = <M extends Model>(m: M): (() => Query<M>) => {
  return {} as any;
};

export const select = <M extends Model, K1 extends string, Name1 extends string = string>(
  f: Column<K1, Name1, ColumnMetaData<M>>,
): (<
  K2 extends string,
  Name2 extends string,
  ExistingColumns extends Column<K2, Name2, ColumnMetaData<M>>
>(
  q: Query<M, ExistingColumns>,
) => Query<M, ExistingColumns | Column<K1, Name2, ColumnMetaData<M>>>) => {
  return {} as any;
};

export const where = <
  M extends Model,
  CMD extends ColumnMetaData<M>,
  K1 extends string,
  Name1 extends string,
  C extends Column<K1, Name1, CMD>,
  O extends Operators
>(
  args: [C, O, OperandTypeForOperator<O, GetJSTypeOfColumn<C>>],
): (<
  K2 extends string,
  Name2 extends string,
  ExistingColumns extends Column<K2, Name2, ColumnMetaData<M>>
>(
  q: Query<M, ExistingColumns>,
) => Query<M, ExistingColumns>) => {
  return {} as any;
};

export const execute = <
  M extends Model,
  K1 extends string,
  Name1 extends string,
  CMD extends ColumnMetaData<M>,
  ExistingColumns extends Column<K1, Name1, CMD>
>(
  q: Query<M, ExistingColumns>,
): Promise<
  UnionToIntersection<
    ExistingColumns extends Column<infer K, infer Name, infer CMD2>
      ? (CMD2 extends ColumnMetaData<infer M2, infer Type2>
          ? (M2['columns'][Name] extends Column<
              infer K3,
              infer Name3,
              ColumnMetaData<M2, infer Type3>
            >
              ? { [k in Name3]: GetJSTypeFromSqlType<Type3> }
              : never)
          : never)
      : never
  >
> => {
  return {} as any;
};
