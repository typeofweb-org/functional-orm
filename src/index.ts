export type Model = {
  name: string;
};

/**
 * @description nominal objects which are incompatible even if structurally equivalent
 */
declare const $brand: unique symbol;
type Column<K, T extends ColumnMetaData<Model>> = T & { [$brand]: K };

type Diff<T, U> = T extends U ? never : T;

/**
 * @description object with fields which are in M but not in Model
 */
type RawModelOf<M extends Model> = {
  [key in Diff<keyof M, keyof Model>]: M[key];
};

/**
 * @description fields which are in M but not in Model
 */
type ModelField<M extends Model> = RawModelOf<M>[keyof RawModelOf<M>];

/**
 * @description internal representation of a query
 */
type Query<M extends Model, F extends ModelField<M> = never> = {
  model: M;
};

/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
type ColumnMetaData<M extends Model> = {
  type: string;
  notNull: boolean;
  // … @todo
};

type User = Model & {
  id: Column<'user.id', ColumnMetaData<User>>;
  age: Column<'user.age', ColumnMetaData<User>>;
};

const USER = {
  age: { type: 'TEXT', notNull: true },
  id: { type: 'TEXT', notNull: true },
  name: 'user',
} as User;

type Invoice = Model & {
  id: Column<'invoice.id', ColumnMetaData<Invoice>>;
  age: Column<'invoice.age', ColumnMetaData<Invoice>>;
};

const INVOICE = {
  id: { type: 'TEXT', notNull: true },
  name: 'invoice',
} as Invoice;

const from = <M extends Model>(model: M): Query<M> => ({ model });

const select = <Q extends Query<Model>, T extends ModelField<Q['model']>>(f: T, q: Q) => {
  return q;
};

// function where() {}

// function orderBy() {}

// function execute() {}

const x2 = select(USER.age, from(USER));

const from2 = <M extends Model>(model: M): Api<M> => {
  return {} as Api<M>;
};

const select2 = function<M extends Model, F extends ModelField<M>, E extends ModelField<M>>(
  this: Api<M, E>,
  f: F
) {
  return {} as Api<M, F | E>;
};

type Api<M extends Model, F extends ModelField<M> = never> = {
  from2: typeof from2;
  select2: typeof select2;
};

const x = from2(USER)
  .select2(USER.id)
  .select2(USER.age);

// R.pipe(
//   from(USER),
//   select(USER.id)
//   // where(USER.id, { in: [1, 2, 3] }), // in (symbol) ? mongo
//   // orderBy(Asc(USER.id)),
//   // execute,
// );

type Query2<M extends Model, CM extends Column<unknown, ColumnMetaData<M>> = never> = {
  model: M;
};

const fromF = <M extends Model>(model: M): Query2<M> => ({ model });

const selectF = <
  K,
  CM extends ColumnMetaData<Model>,
  EC extends Column<unknown, ColumnMetaData<Model>>
>(
  c: Column<K, CM>
): CM extends ColumnMetaData<infer M>
  ? ((m: Query2<M, EC>) => Query2<M, Column<K, CM> | EC>)
  : never => {
  // tslint:disable-next-line:no-any
  return {} as any;
};

// selectF(USER.age)(selectF(USER.id)(fromF(USER)))
const fr = fromF(USER);
const z = selectF(USER.id);

const res = selectF(USER.id)(fromF(USER));

const res2 = selectF(USER.age)(res);
