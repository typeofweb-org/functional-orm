declare type Model = {
  name: string;
};
/**
 * @description nominal objects which are incompatible even if structurally equivalent
 */
declare const $brand: unique symbol;
declare type Column<K, T> = T & {
  [$brand]: K;
};
declare type Diff<T, U> = T extends U ? never : T;
/**
 * @description object with fields which are in M but not in Model
 */
declare type RawModelOf<M extends Model> = {
  [key in Diff<keyof M, keyof Model>]: M[key];
};
/**
 * @description fields which are in M but not in Model
 */
declare type ModelField<M extends Model> = RawModelOf<M>[keyof RawModelOf<M>];
/**
 * @description internal representation of a query
 */
declare type Query<M extends Model> = {
  model: M;
};
/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
declare type ColumnMetaData = {
  model: Model;
  type: string;
  notNull: boolean;
};
declare type User = Model & {
  id: Column<'user.id', ColumnMetaData>;
  age: Column<'user.age', ColumnMetaData>;
};
declare const USER: User;
declare type Invoice = Model & {
  id: Column<'invoice.id', ColumnMetaData>;
  age: Column<'invoice.age', ColumnMetaData>;
};
declare const INVOICE: Invoice;
declare const from: <M extends Model>(model: M) => Query<M>;
declare const select: <
  Q extends Query<Model>,
  T extends RawModelOf<Q['model']>[Diff<keyof Q['model'], 'name'>]
>(
  f: T,
  q: Q
) => Q;
declare const x2: Query<User>;
declare const from2: <M extends Model>(model: M) => Api<M, never>;
declare const select2: <
  M extends Model,
  F extends RawModelOf<M>[Diff<keyof M, 'name'>],
  E extends RawModelOf<M>[Diff<keyof M, 'name'>]
>(
  this: Api<M, E>,
  f: F
) => Api<M, F | E>;
declare type Api<M extends Model, F extends ModelField<M> = never> = {
  from2: typeof from2;
  select2: typeof select2;
};
declare const x: Api<User, Column<'user.id', ColumnMetaData> | Column<'user.age', ColumnMetaData>>;
declare const fromF: <M extends Model>(model: M) => Query<M>;
declare const selectF2: <
  Q extends Query<Model>,
  T extends RawModelOf<Q['model']>[Diff<keyof Q['model'], 'name'>]
>(
  f: T,
  q: Q
) => Q;
declare type MF<M extends Model> = M[keyof RawModelOf<M>];
declare const selectF: <K, T>(c: Column<K, T>) => Model & Record<string, Column<K, T>>;
declare const fr: Query<User>;
declare const z: Model & Record<string, Column<'user.id', ColumnMetaData>>;
