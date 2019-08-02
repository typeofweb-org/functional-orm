// tslint:disable:no-magic-numbers
import pipe from 'ramda/es/pipe';
import { Column, ColumnMetaData, execute, from, Model, Op, select, where } from './index';

type User = Model & {
  columns: {
    id: Column<'user.id', 'id', ColumnMetaData<User, 'TINYINT'>>;
    age: Column<'user.age', 'age', ColumnMetaData<User, 'TEXT'>>;
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
    id: Column<'invoice.id', 'id', ColumnMetaData<Invoice, 'TINYINT'>>;
    age: Column<'invoice.age', 'age', ColumnMetaData<Invoice, 'TEXT'>>;
  };
};

const INVOICE = {
  name: 'invoice',
  columns: {
    id: { type: 'TINYINT', notNull: true },
    age: { type: 'TEXT', notNull: true },
  },
} as Invoice;

// $ExpectType () => Query<User, never, never, string, string>
const r1 = from(USER);

// $ExpectType <K2 extends string, Name2 extends string, ExistingColumns extends Column<K2, Name2, ColumnMetaData<User, any>>>(q: Query<User, ExistingColumns, never, string, string>) => Query<User, Column<"user.id", "id", ColumnMetaData<User, any>> | ExistingColumns, never, string, string>
const r12 = select(USER.columns.id);

// $ExpectType Query<User, Column<"user.id", "id", ColumnMetaData<User, any>>, never, string, string>
const r2 = select(USER.columns.id)(from(USER)());

// $ExpectType Query<User, Column<"user.age", "age", ColumnMetaData<User, any>>, never, string, string>
const r2b = select(USER.columns.age)(from(USER)());

// $ExpectType Query<User, Column<"user.id", "id", ColumnMetaData<User, any>> | Column<"user.age", "age", ColumnMetaData<User, any>>, never, string, string>
const r3 = select(USER.columns.age)(select(USER.columns.id)(from(USER)()));

// $ExpectType () => Query<User, Column<"user.id", "id", ColumnMetaData<User, any>> | Column<"user.age", "age", ColumnMetaData<User, any>>, never, string, string>
const execute1 = pipe(
  from(USER),
  select(USER.columns.id),
  select(USER.columns.age),
);

// $ExpectType () => Query<Invoice, Column<"invoice.id", "id", ColumnMetaData<Invoice, any>> | Column<"invoice.age", "age", ColumnMetaData<Invoice, any>>, never, string, string>
const execute2 = pipe(
  from(INVOICE),
  select(INVOICE.columns.id),
  select(INVOICE.columns.age),
);

// $ExpectType <K2 extends string, Name2 extends string, ExistingColumns extends Column<K2, Name2, ColumnMetaData<Model, any>>>(q: Query<Model, ExistingColumns, never, string, string>) => Query<Model, ExistingColumns, never, string, string>
const w1 = where([USER.columns.id, Op.$eq, 12]);

// $ExpectType <K2 extends string, Name2 extends string, ExistingColumns extends Column<K2, Name2, ColumnMetaData<Model, any>>>(q: Query<Model, ExistingColumns, never, string, string>) => Query<Model, ExistingColumns, never, string, string>
const w2 = where([USER.columns.id, Op.$in, [12]]);

// $ExpectType () => Query<User, Column<"user.id", "id", ColumnMetaData<User, any>> | Column<"user.age", "age", ColumnMetaData<User, any>>, never, string, string>
const execute3 = pipe(
  from(USER),
  select(USER.columns.id),
  select(USER.columns.age),
  where([USER.columns.id, Op.$eq, 12]),
);

// $ExpectType () => Promise<{ id: number; } & { age: string; }>
const execute4 = pipe(
  from(USER),
  select(USER.columns.id),
  select(USER.columns.age),
  where([USER.columns.id, Op.$eq, 12]),
  execute,
);
