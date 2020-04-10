export type TableName = {
  table_name: string;
};

export type SingularColumnType =
  | 'int8'
  | 'bit'
  | 'varbit'
  | 'bool'
  | 'box'
  | 'bytea'
  | 'bpchar'
  | 'varchar'
  | 'cidr'
  | 'circle'
  | 'date'
  | 'float8'
  | 'inet'
  | 'int4'
  | 'interval'
  | 'json'
  | 'jsonb'
  | 'line'
  | 'lseg'
  | 'macaddr'
  | 'macaddr8'
  | 'money'
  | 'numeric'
  | 'path'
  | 'pg_lsn'
  | 'point'
  | 'polygon'
  | 'float4'
  | 'int2'
  | 'text'
  | 'time'
  | 'timetz'
  | 'timestamp'
  | 'timestamptz'
  | 'tsquery'
  | 'tsvector'
  | 'txid_snapshot'
  | 'uuid'
  | 'xml';

export type ArrayColumnType =
  | '_int8'
  | '_bit'
  | '_varbit'
  | '_bool'
  | '_box'
  | '_bytea'
  | '_bpchar'
  | '_varchar'
  | '_cidr'
  | '_circle'
  | '_date'
  | '_float8'
  | '_inet'
  | '_int4'
  | '_interval'
  | '_json'
  | '_jsonb'
  | '_line'
  | '_lseg'
  | '_macaddr'
  | '_macaddr8'
  | '_money'
  | '_numeric'
  | '_path'
  | '_pg_lsn'
  | '_point'
  | '_polygon'
  | '_float4'
  | '_int2'
  | '_text'
  | '_time'
  | '_timetz'
  | '_timestamp'
  | '_timestamptz'
  | '_tsquery'
  | '_tsvector'
  | '_txid_snapshot'
  | '_uuid'
  | '_xml';

export type ColumnType = SingularColumnType | ArrayColumnType;

export type ColumnSchema = {
  column_name: string;
  udt_name: ColumnType;
  is_nullable: 'YES' | 'NO';
};

export type TableSchema = {
  tableName: TableName['table_name'];
  schema: ColumnSchema[];
};
