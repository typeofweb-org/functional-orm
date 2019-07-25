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

/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
type ColumnMetaData = {
  type: string;
  notNull: boolean;
  // … @todo
};

type User = Model & {
  id: Column<'user.id', ColumnMetaData>;
  age: Column<'user.age', ColumnMetaData>;
};

const USER = {
  age: { type: 'TEXT', notNull: true },
  id: { type: 'TEXT', notNull: true },
  name: 'user',
} as User;

type Invoice = Model & {
  id: Column<'invoice.id', ColumnMetaData>;
  age: Column<'invoice.age', ColumnMetaData>;
};

const INVOICE = {
  id: { type: 'TEXT', notNull: true },
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
