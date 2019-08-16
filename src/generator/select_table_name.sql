SELECT DISTINCT
  table_name
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
ORDER BY
  table_name;

