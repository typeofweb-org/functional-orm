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

type Table = {
  name: string;
  columns: Record<string, ColumnMetaData<Table>>;
};

/**
 * @description Types of columns which are mappable to JS
 */
type ColumnMetaDataType = 'TEXT' | 'DATE' | 'TINYINT';

type Pretty<T> = { [K in keyof T]: T[K] };

/**
 * @description Convert SQL column string literal type to JavaScript type
 */
type GetJSTypeFromSqlType<T extends ColumnMetaDataType, Nullable extends boolean> =
  | {
      DATE: Date;
      TEXT: string;
      TINYINT: number;
    }[T]
  | (Nullable extends false ? null : never);

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
type ColumnMetaData<_M extends Table, Type extends ColumnMetaDataType = ColumnMetaDataType> = {
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
