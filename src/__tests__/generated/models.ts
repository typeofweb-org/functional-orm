/**
 * AUTOMATICALLY GENERATED
 * DO NOT MODIFY
 * ANY CHANGES WILL BE OVERWRITTEN
 */

export const Invoice = {
  name: 'invoice',
  columns: {
    id: { type: 'int4', notNull: true },
    value: { type: 'float4', notNull: true },
    addedAt: { type: 'date', notNull: true },
  },
} as const;

export const User = {
  name: 'user',
  columns: {
    id: { type: 'int4', notNull: true },
    email: { type: 'text', notNull: true },
    name: { type: 'text', notNull: false },
    boolColumn: { type: 'bool', notNull: true },
    charColumn: { type: 'bpchar', notNull: false },
    dateColumn: { type: 'date', notNull: false },
    float4Column: { type: 'float4', notNull: false },
    float8Column: { type: 'float8', notNull: true },
    int2Column: { type: 'int2', notNull: false },
    int4Column: { type: 'int4', notNull: true },
    int8Column: { type: 'int8', notNull: false },
    numericColumn: { type: 'numeric', notNull: true },
    jsonbColumn: { type: 'jsonb', notNull: true },
    textColumn: { type: 'text', notNull: false },
    timestampColumn: { type: 'timestamp', notNull: true },
    timestamptzColumn: { type: 'timestamptz', notNull: false },
    varcharColumn: { type: 'varchar', notNull: true },
  },
} as const;
