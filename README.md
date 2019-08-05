# Functional ORM

[![Build Status](https://travis-ci.org/mmiszy/functional-orm.svg?branch=master)](https://travis-ci.org/mmiszy/functional-orm)

It's not really an ORM, more like a querybuilder. But the points are:

- it's **completely typesafe** thanks to TypeScript
- it's build in a **functional** fashion

Fancy, huh?

## Goals of the project

### Typesafe queries

One of the main design goals of this library is to be able to provide completely typesafe queries. It means that when you do `SELECT id, name` you actually get `{ id: number, age: string }` without the need to write **any** types manually 😎

### Generating types based on DB structure

What makes this library unique is the fact that you don't have to write any types or models manually. They're all **generated based on your database structure** and provide 100% typesafety!

## Examples (draft syntax)

Every part of a query is a function which you can compose. Assuming that `USER` and `INVOICE` are automatically generated models:

### Immutable query

Returns a function which returns immutable query representation:

```ts
const query1 = select(USER.columns.id)(from(USER)());
```

### Typesafety of tables

This is a compile-time TypeScript error even though `USER.id` and `INVOICE.id` are identical
Thanks to Functional ORM, each column has a unique nominal type which is incompatible with others:

```ts
const query2 = select(USER.columns.id)(from(INVOICE)());
```

### Typesafety of columns

Returns a function which returns query selecting `age` and `id` from `USER`:

```ts
const query3 = select(USER.columns.name)(select(USER.columns.id)(from(USER)()));
```

Keep in mind that all queries are typesafe.
This returns a Promise of `{ id: number, name: string }`

```ts
const result1 = execute(select(USER.columns.name)(select(USER.columns.id)(from(USER)())));
```

### Nicer syntax with `pipe`

This syntax quickly gets a bit cumbersome. Thankfully, you can use `pipe` to compose the functions in natural (reversed) order:

```ts
const result2 = pipe(
  from(USER),
  select(USER.columns.id),
  select(USER.columns.name),
  execute,
);
```

### Typesafe operators

Operators are also typesafe! In this case, Functional ORM knows that types of `USER.id` and `12` have to match:

```ts
const result2 = pipe(
  from(USER),
  select(USER.columns.id),
  select(USER.columns.name),
  where([USER.columns.id, $eq, 12]),
  execute,
);
```

This would be a compile-time TypeScript error:

```ts
where([USER.columns.name, $eq, 12]); // Type 'number' is not assignable to type 'string'.
```

This is also an error because `$in` requires the argument to be an array of values:

```ts
where([USER.columns.name, $in, 12]); // Type 'number' is not assignable to type 'number[]'.
```
