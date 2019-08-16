import fc from 'fast-check';

const contains = (pattern: string, text: string) => text.indexOf(pattern) !== -1;

test('My Greeter', () => {
  expect(1).toBe(1);

  fc.assert(
    fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
      expect(contains(b, a + b + c)).toBe(true);
    }),
  );
});
