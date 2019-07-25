type Model = {
  name: string;
};

/**
 * @description nominal objects which are incompatible even if structurally equivalent
 */
declare const $brand: unique symbol;
type Column<K, T> = T & { [$brand]: K };

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
type Query<M extends Model> = {
  model: M;
};

type User = Model & {
  id: Column<'user.id', { a: number }>;
  age: Column<'user.age', { a: number }>;
};

const USER = {
  age: { a: 1 },
  id: { a: 1 },
  name: 'user',
} as User;

type Invoice = Model & {
  id: Column<'invoice.id', { a: number }>;
  age: Column<'invoice.age', { a: number }>;
};

const INVOICE = {
  id: { a: 1 },
  name: 'invoice',
} as Invoice;

const from = <M extends Model>(model: M): Query<M> => ({ model });

const select = <Q extends Query<Model>>(f: ModelField<Q['model']>, q: Q) => {
  return f;
};

// function where() {}

// function orderBy() {}

// function execute() {}

const x = select(USER.age, from(USER));

// R.pipe(
//   from(USER),
//   select(USER.id)
//   // where(USER.id, { in: [1, 2, 3] }), // in (symbol) ? mongo
//   // orderBy(Asc(USER.id)),
//   // execute,
// );
