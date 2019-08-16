export type TableName = {
  table_name: string;
};

export type ColumnType =
  | 'bpchar'
  | 'char'
  | 'varchar'
  | 'text'
  | 'citext'
  | 'uuid'
  | 'bytea'
  | 'inet'
  | 'time'
  | 'timetz'
  | 'interval'
  | 'name'
  | 'int2'
  | 'int4'
  | 'int8'
  | 'float4'
  | 'float8'
  | 'numeric'
  | 'money'
  | 'oid'
  | 'bool'
  | 'json'
  | 'jsonb'
  | 'date'
  | 'timestamp'
  | 'timestamptz'
  | '_int2'
  | '_int4'
  | '_int8'
  | '_float4'
  | '_float8'
  | '_numeric'
  | '_money'
  | '_bool'
  | '_varchar'
  | '_text'
  | '_citext'
  | '_uuid'
  | '_bytea'
  | '_json'
  | '_jsonb'
  | '_timestamptz';

export type ColumnSchema = {
  column_name: string;
  udt_name: ColumnType;
  is_nullable: 'YES' | 'NO';
};
