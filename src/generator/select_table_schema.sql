SELECT
  column_name,
  udt_name,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_name = $1
  AND table_schema = 'public';

