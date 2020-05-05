# Gostek

![CI](https://github.com/typeofweb/functional-orm/workflows/CI/badge.svg?branch=master)
[![Greenkeeper badge](https://flat.badgen.net/dependabot/typeofweb/functional-orm?icon=dependabot)](https://dependabot.com/)

Gostek is a **completely typesafe querybuilder** written in TypeScript

Fancy, huh?

## Goals of the project

### Typesafe queries

One of the main design goals of this library is to be able to provide completely typesafe queries. It means that when you do `SELECT id, name` you actually get `{ id: number, age: string }` without the need to write **any** types manually 😎

### Generating types based on DB structure

What makes this library unique is the fact that you don't have to write any types or models manually. They're all **generated based on your database structure** and provide 100% typesafety!

## Examples (draft syntax)

Gostek generates types and models based on your DB schema, for example:

```ts
const User = {
  name: 'user',
  columns: {
    id: { type: 'int4', notNull: true },
    name: { type: 'text', notNull: false },
  },
} as const;
```

### Immutable query

Each function returns an immutable query representation:

```ts
const query1 = db.from(User).select(['id']);
```

The following query selects `age` and `id` from `User`:

```ts
const query2 = db.from(User).select(['id', 'age']);
```

It would be a compile-time error to try to select columns which don't exist:

```ts
const query3 = db.from(User).select(['id', 'foo']);
// Argument of type '"foo"' is not assignable to parameter of type '"*" | ("age" | "id")[]'.
```

All queries are typesafe! Executing it returns only fields which are selected:

```ts
const result1 = await db.from(User).select(['id']).execute();
// {
//   readonly id: number;
// }[]
```

Mind that nullability of `name` was taken into account as well.

There's a shorthand notation for selecting all properties and it's also typesafe:

```ts
const result2 = await db.from(User).select('*').execute();
// {
//   readonly id: number;
//   readonly name: string | null;
// }[]
```

### Typesafe operators

Operators are also typesafe! In this case, Gostek knows that types of `User.name` and `name` have to match:

```ts
db.from(User).select(['name']).where(['name', Op.$eq, 'Kasia']);
```

The library is also aware of the operator you're using:

```ts
db.from(User)
  .select(['name'])
  .where(['id', Op.$in, [1, 2, 3]]);
// $in requires an array!
```

This would be a compile-time TypeScript error:

```ts
db.from(User).select(['name']).where(['name', Op.$eq, 123]);
// Type 'number' is not assignable to type 'string | null'.
```

This is also an error because `$in` requires the argument to be an array of values:

```ts
db.from(User).select(['name']).where(['name', Op.$in, 'Michał']);
// Type 'string' is not assignable to type '(string | null)[]'.
```

## 0.1.0 plan

- [x] finish generator which outputs safely-typed models for simple tables
- [x] support PostgreSQL
- [x] make sure all queries from the README work on a real database
