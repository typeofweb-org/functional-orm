import { ColumnType } from '../generator/types';
const $eq = Symbol('$eq');
const $neq = Symbol('$neq');
const $in = Symbol('$in');
const $or = '$or';
const $and = '$and';

import * as PgSql2 from 'pg-sql2';
import { QueryConfig } from 'pg';
import { IDatabase } from 'pg-promise';

export const Op = {
  $eq: $eq,
  $neq: $neq,
  $in: $in,
} as const;
type Operators = typeof Op[keyof typeof Op];

export const WhereOp = {
  $or: $or,
  $and: $and,
} as const;
type WhereJoinOperators = typeof WhereOp[keyof typeof WhereOp];

type OperandTypeForOperator<O extends Operators, T> = {
  [$eq]: T;
  [$neq]: T;
  [$in]: T[];
}[O];

export type Table = {
  name: string;
  columns: Record<string, ColumnMetaData<Table>>;
};

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [prop: string]: Json };

export type Pretty<T> = { [K in keyof T]: T[K] };

type OneKey<Key extends string, Value = any> = {
  [P in Key]: Record<P, Value> &
    Partial<Record<Exclude<Key, P>, never>> extends infer O
    ? { [Q in keyof O]: O[Q] }
    : never;
}[Key];

/**
 * @description Convert SQL column string literal type to JavaScript type
 */
type SupportedTypes = {
  bit: 'Not supported yet!';
  bool: boolean;
  box: 'Not supported yet!';
  bytea: 'Not supported yet!';
  char: string;
  bpchar: string;
  cidr: 'Not supported yet!';
  circle: 'Not supported yet!';
  date: Date;
  float4: number;
  float8: number;
  inet: 'Not supported yet!';
  int2: number;
  int4: number;
  int8: BigInt;
  interval: 'Not supported yet!';
  json: 'Not supported yet!';
  jsonb: Json;
  line: 'Not supported yet!';
  lseg: 'Not supported yet!';
  macaddr: 'Not supported yet!';
  macaddr8: 'Not supported yet!';
  money: 'Not supported yet!';
  numeric: number;
  path: 'Not supported yet!';
  pg_lsn: 'Not supported yet!';
  point: 'Not supported yet!';
  polygon: 'Not supported yet!';
  text: string;
  time: 'Not supported yet!';
  timestamp: Date;
  timestamptz: Date;
  timetz: 'Not supported yet!';
  tsquery: 'Not supported yet!';
  tsvector: 'Not supported yet!';
  txid_snapshot: 'Not supported yet!';
  uuid: 'Not supported yet!';
  varbit: 'Not supported yet!';
  varchar: string;
  xml: 'Not supported yet!';
};

type GetJSTypeFromSqlType<
  T extends ColumnType,
  Nullable extends boolean
> = T extends keyof SupportedTypes
  ? SupportedTypes[T] | (Nullable extends false ? null : never)
  : never;

type GetColumnJSType<
  SelectedTable extends Table,
  SelectedColumn extends keyof SelectedTable['columns']
> = GetJSTypeFromSqlType<
  SelectedTable['columns'][SelectedColumn]['type'],
  SelectedTable['columns'][SelectedColumn]['notNull']
>;

type WhereConditionType<
  SelectedTable extends Table,
  ConditionColumn extends keyof SelectedTable['columns'],
  Operator extends Operators
> = [
  ConditionColumn,
  Operator,
  OperandTypeForOperator<
    Operator,
    GetColumnJSType<SelectedTable, ConditionColumn>
  >,
];

/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
type ColumnMetaData<_M extends Table, Type extends ColumnType = ColumnType> = {
  type: Type;
  notNull: boolean;
  // … @todo
};

function conditionToSql<SelectedTable extends Table>([
  column,
  operator,
  value,
]: [
  keyof SelectedTable['columns'],
  Operators,
  OperandTypeForOperator<
    Operators,
    GetColumnJSType<SelectedTable, keyof SelectedTable['columns']>
  >,
]) {
  switch (operator) {
    case Op.$eq:
      return PgSql2.query`${PgSql2.identifier(
        column as string,
      )} = ${PgSql2.value(value)}`;
    case Op.$neq:
      return PgSql2.query`${PgSql2.identifier(
        column as string,
      )} <> ${PgSql2.value(value)}`;
    case Op.$in:
      return PgSql2.query`${PgSql2.identifier(
        column as string,
      )} in (${PgSql2.join(
        (value as Array<any>).map((v) => PgSql2.value(v)),
        ',',
      )})`;
    default:
      const _: never = operator;
      return PgSql2.query``;
  }
}

class Query<
  SelectedTable extends Table,
  ExistingColumns extends keyof SelectedTable['columns'] = never
> {
  protected table!: SelectedTable;

  getQuery(): QueryConfig {
    throw new Error('Not implemented!');
  }

  execute(
    pgConnection: IDatabase<{}>,
  ): Promise<
    Array<
      {
        [Col in ExistingColumns]: GetColumnJSType<SelectedTable, Col>;
      }
    >
  > {
    const { text, values } = this.getQuery();

    return pgConnection.manyOrNone(text, values);
  }

  constructor(table: SelectedTable) {
    this.table = table;
  }
}

class SelectQuery<
  SelectedTable extends Table,
  ExistingColumns extends keyof SelectedTable['columns'] = never
> extends Query<SelectedTable, ExistingColumns> {
  private columns: Array<keyof SelectedTable['columns']> | '*' = [];
  private conditionsData: Array<{
    whereJoinOperator: WhereJoinOperators;
    conditions: [
      keyof SelectedTable['columns'],
      Operators,
      OperandTypeForOperator<
        Operators,
        GetColumnJSType<SelectedTable, keyof SelectedTable['columns']>
      >,
    ][];
  }> = [];

  select<NewColumns extends Array<keyof SelectedTable['columns']> | '*'>(
    columns: NewColumns,
  ): SelectQuery<
    SelectedTable,
    | ExistingColumns
    | (NewColumns extends '*'
        ? keyof SelectedTable['columns']
        : NewColumns[number])
  > {
    if (this.columns === '*') {
    } else if (columns === '*') {
      this.columns = '*';
    } else {
      this.columns.push(...columns);
    }
    return this as SelectQuery<
      SelectedTable,
      | ExistingColumns
      | (NewColumns extends '*'
          ? keyof SelectedTable['columns']
          : NewColumns[number])
    >;
  }

  where<
    ConditionColumn extends keyof SelectedTable['columns'],
    Operator extends Operators
  >(
    conditionsData: OneKey<
      WhereJoinOperators,
      [WhereConditionType<SelectedTable, ConditionColumn, Operator>]
    >,
  ): SelectQuery<SelectedTable, ExistingColumns>;
  where<
    ConditionColumn1 extends keyof SelectedTable['columns'],
    Operator1 extends Operators,
    ConditionColumn2 extends keyof SelectedTable['columns'],
    Operator2 extends Operators
  >(
    conditionsData: OneKey<
      WhereJoinOperators,
      [
        WhereConditionType<SelectedTable, ConditionColumn1, Operator1>,
        WhereConditionType<SelectedTable, ConditionColumn2, Operator2>,
      ]
    >,
  ): SelectQuery<SelectedTable, ExistingColumns>;
  where<
    ConditionColumn1 extends keyof SelectedTable['columns'],
    Operator1 extends Operators,
    ConditionColumn2 extends keyof SelectedTable['columns'],
    Operator2 extends Operators,
    ConditionColumn3 extends keyof SelectedTable['columns'],
    Operator3 extends Operators
  >(
    conditionsData: OneKey<
      WhereJoinOperators,
      [
        WhereConditionType<SelectedTable, ConditionColumn1, Operator1>,
        WhereConditionType<SelectedTable, ConditionColumn2, Operator2>,
        WhereConditionType<SelectedTable, ConditionColumn3, Operator3>,
      ]
    >,
  ): SelectQuery<SelectedTable, ExistingColumns>;
  where<
    ConditionColumn1 extends keyof SelectedTable['columns'],
    Operator1 extends Operators,
    ConditionColumn2 extends keyof SelectedTable['columns'],
    Operator2 extends Operators,
    ConditionColumn3 extends keyof SelectedTable['columns'],
    Operator3 extends Operators,
    ConditionColumn4 extends keyof SelectedTable['columns'],
    Operator4 extends Operators
  >(
    conditionsData: OneKey<
      WhereJoinOperators,
      [
        WhereConditionType<SelectedTable, ConditionColumn1, Operator1>,
        WhereConditionType<SelectedTable, ConditionColumn2, Operator2>,
        WhereConditionType<SelectedTable, ConditionColumn3, Operator3>,
        WhereConditionType<SelectedTable, ConditionColumn4, Operator4>,
      ]
    >,
  ): SelectQuery<SelectedTable, ExistingColumns>;
  where<
    ConditionColumn1 extends keyof SelectedTable['columns'],
    Operator1 extends Operators,
    ConditionColumn2 extends keyof SelectedTable['columns'],
    Operator2 extends Operators,
    ConditionColumn3 extends keyof SelectedTable['columns'],
    Operator3 extends Operators,
    ConditionColumn4 extends keyof SelectedTable['columns'],
    Operator4 extends Operators,
    ConditionColumn5 extends keyof SelectedTable['columns'],
    Operator5 extends Operators
  >(
    conditionsData: OneKey<
      WhereJoinOperators,
      [
        WhereConditionType<SelectedTable, ConditionColumn1, Operator1>,
        WhereConditionType<SelectedTable, ConditionColumn2, Operator2>,
        WhereConditionType<SelectedTable, ConditionColumn3, Operator3>,
        WhereConditionType<SelectedTable, ConditionColumn4, Operator4>,
        WhereConditionType<SelectedTable, ConditionColumn5, Operator5>,
      ]
    >,
  ): SelectQuery<SelectedTable, ExistingColumns>;
  where(conditionsData: any): SelectQuery<SelectedTable, ExistingColumns> {
    for (const [key, value] of Object.entries(conditionsData)) {
      if (value) {
        this.conditionsData.push({
          whereJoinOperator: (key as unknown) as WhereJoinOperators,
          conditions: value as any,
        });
      }
    }

    return this;
  }

  getQuery(): QueryConfig {
    const from = PgSql2.identifier(this.table.name);
    const fields = Array.isArray(this.columns)
      ? PgSql2.join(
          this.columns.map((fieldName) =>
            PgSql2.identifier(this.table.name, fieldName as string),
          ),
          ', ',
        )
      : PgSql2.raw('*');

    const conditions =
      this.conditionsData.length < 1
        ? PgSql2.query``
        : PgSql2.query`WHERE ${PgSql2.join(
            this.conditionsData.map((cd) =>
              PgSql2.join(
                cd.conditions.map((c) => conditionToSql(c)),
                cd.whereJoinOperator === WhereOp.$and ? ' AND ' : ' OR ',
              ),
            ),
            ') AND (',
          )}`;

    const query = PgSql2.query`SELECT ${fields} FROM ${from} ${conditions}`;

    return PgSql2.compile(query);
  }

  constructor(table: SelectedTable) {
    super(table);
  }
}

class InsertQuery<
  SelectedTable extends Table,
  ExistingColumns extends keyof SelectedTable['columns'] = never
> extends Query<SelectedTable, ExistingColumns> {
  private entityData:
    | {
        [K in keyof SelectedTable['columns']]: GetColumnJSType<
          SelectedTable,
          keyof SelectedTable['columns']
        >;
      }
    | null;

  insertOne<
    NewEntity extends {
      [K in keyof SelectedTable['columns']]: GetColumnJSType<SelectedTable, K>;
    }
  >(data: NewEntity): InsertQuery<SelectedTable> {
    this.entityData = data;

    return this;
  }

  getQuery(): QueryConfig {
    if (!this.entityData) {
      throw new Error(
        'No statement has been provided! Use i.e. "insertOne()" first.',
      );
    }

    const from = PgSql2.identifier(this.table.name);
    const columns = PgSql2.join(
      Object.keys(this.entityData).map((value) => PgSql2.identifier(value)),
      ', ',
    );
    const values = PgSql2.join(
      Object.values(this.entityData).map((value) => PgSql2.value(value)),
      ', ',
    );

    const query = PgSql2.query`INSERT INTO ${from}(${columns}) VALUES(${values})`;

    return PgSql2.compile(query);
  }

  constructor(table: SelectedTable) {
    super(table);
    this.entityData = null;
  }
}

export const Gostek = {
  from<T extends Table>(table: T): SelectQuery<T> {
    return new SelectQuery(table);
  },
  to<T extends Table>(table: T): InsertQuery<T> {
    return new InsertQuery(table);
  },
};
