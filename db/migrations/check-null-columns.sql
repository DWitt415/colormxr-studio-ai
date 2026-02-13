-- Check null values in palette_gallery table
SELECT
  column_name,
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE column_value IS NULL) AS null_count,
  ROUND((COUNT(*) FILTER (WHERE column_value IS NULL))::numeric / COUNT(*) * 100, 2) AS null_percentage
FROM (
  SELECT
    column_name,
    (json_each_text(row_to_json(t))).value AS column_value
  FROM
    palette_gallery t,
    information_schema.columns c
  WHERE
    c.table_name = 'palette_gallery'
    AND c.table_schema = 'public'
) AS subq
GROUP BY
  column_name
ORDER BY
  null_count DESC;
