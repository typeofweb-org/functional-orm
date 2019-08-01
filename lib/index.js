'use strict';
const USER = {
  age: { model: USER, type: 'TEXT', notNull: true },
  id: { type: 'TEXT', notNull: true },
  name: 'user',
};
const INVOICE = {
  id: { type: 'TEXT', notNull: true },
  name: 'invoice',
};
const from = model => ({ model });
const select = (f, q) => {
  return q;
};
// function where() {}
// function orderBy() {}
// function execute() {}
const x2 = select(USER.age, from(USER));
const from2 = model => {
  return {};
};
const select2 = function(f) {
  return {};
};
const x = from2(USER)
  .select2(USER.id)
  .select2(USER.age);
// R.pipe(
//   from(USER),
//   select(USER.id)
//   // where(USER.id, { in: [1, 2, 3] }), // in (symbol) ? mongo
//   // orderBy(Asc(USER.id)),
//   // execute,
// );
const fromF = model => ({ model });
const selectF2 = (f, q) => {
  return q;
};
const selectF = c => {
  // tslint:disable-next-line:no-any
  return {};
};
// selectF(USER.age)(selectF(USER.id)(fromF(USER)))
const fr = fromF(USER);
const z = selectF(USER.id);
