import { ColumnType } from './generator/types';
const $eq = Symbol('$eq');
const $neq = Symbol('$neq');
const $in = Symbol('$in');

type Operators = typeof $eq | typeof $neq | typeof $in;
export const Op = {
  $eq: $eq as typeof $eq,
  $neq: $neq as typeof $neq,
  $in: $in as typeof $in,
};

type OperandTypeForOperator<O extends Operators, T> = {
  [$eq]: T;
  [$neq]: T;
  [$in]: T[];
}[O];

export type Table = {
  name: string;
  columns: Record<string, ColumnMetaData<Table>>;
};

type Pretty<T> = { [K in keyof T]: T[K] };

/**
 * @description Convert SQL column string literal type to JavaScript type
 */
type SupportedTypes = {
  bit: 'Not supported yet!';
  bool: boolean;
  box: 'Not supported yet!';
  bytea: 'Not supported yet!';
  char: string;
  cidr: 'Not supported yet!';
  circle: 'Not supported yet!';
  date: Date;
  float4: number;
  float8: number;
  inet: 'Not supported yet!';
  int2: number;
  int4: number;
  int8: number;
  interval: 'Not supported yet!';
  json: 'Not supported yet!';
  jsonb: 'Not supported yet!';
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
  timestamp: number;
  timestamptz: number;
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
> = Pretty<
  GetJSTypeFromSqlType<
    SelectedTable['columns'][SelectedColumn]['type'],
    SelectedTable['columns'][SelectedColumn]['notNull']
  >
>;

/**
 * @description information about column such as if it's nullable, foreign key, autoincrement etc.
 */
type ColumnMetaData<_M extends Table, Type extends ColumnType = ColumnType> = {
  type: Type;
  notNull: boolean;
  // … @todo
};

type Query<
  SelectedTable extends Table,
  ExistingColumns extends keyof SelectedTable['columns'] = never
> = {
  t: SelectedTable;
  c: ExistingColumns;
  select<NewColumns extends Array<keyof SelectedTable['columns']> | '*'>(
    columns: NewColumns,
  ): Query<
    SelectedTable,
    ExistingColumns | (NewColumns extends '*' ? keyof SelectedTable['columns'] : NewColumns[number])
  >;
  where<ConditionColumn extends keyof SelectedTable['columns'], Operator extends Operators>(
    condition: [
      ConditionColumn,
      Operator,
      OperandTypeForOperator<Operator, GetColumnJSType<SelectedTable, ConditionColumn>>,
    ],
  ): Query<SelectedTable, ExistingColumns>;
  // then(
  //   onfulfilled?: (
  //     value: Array<
  //       {
  //         [Col in ExistingColumns]: GetColumnJSType<SelectedTable, Col>;
  //       }
  //     >,
  //   ) => any,
  //   onrejected?: (reason: any) => any,
  // ): any;
  execute(): Promise<
    Array<
      {
        [Col in ExistingColumns]: GetColumnJSType<SelectedTable, Col>;
      }
    >
  >;
};

export const db = {
  from<T extends Table>(_m: T): Query<T> {
    // tslint:disable-next-line: no-any
    return {} as any;
  },
};
