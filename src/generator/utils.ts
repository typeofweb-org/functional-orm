/**
 * @see https://github.com/graphile/graphile-engine/blob/e863fd37bddd1a7d40bd6e5e90f5065d1e64949b/packages/graphile-build-pg/src/plugins/PgIntrospectionPlugin.js#L593-L597
 */
export const xByY = <K extends keyof T, T extends Record<K, string>>(
  arrayOfX: Array<T>,
  attrKey: K,
) =>
  arrayOfX.reduce((acc, x) => {
    acc[x[attrKey]] = x;
    return acc;
  }, {} as Record<T[K], T>);

/**
 * @see https://github.com/graphile/graphile-engine/blob/e863fd37bddd1a7d40bd6e5e90f5065d1e64949b/packages/graphile-build-pg/src/plugins/PgIntrospectionPlugin.js#L598-L603
 */
export const xByYAndZ = <K1 extends keyof T, K2 extends keyof T, T extends Record<K1, string>>(
  arrayOfX: Array<T>,
  attrKey: K1,
  attrKey2: K2,
) =>
  arrayOfX.reduce((acc, x) => {
    if (!acc[x[attrKey]]) acc[x[attrKey]] = {} as Record<T[K2], T>;
    acc[x[attrKey]][x[attrKey2]] = x;
    return acc;
  }, {} as Record<T[K1], Record<T[K2], T>>);

/**
 * @ https://github.com/graphile/graphile-engine/blob/e863fd37bddd1a7d40bd6e5e90f5065d1e64949b/packages/graphile-build-pg/src/utils.js#L2-L31
 */
export const parseTags = (str: string) => {
  return str.split(/\r?\n/).reduce(
    (acc, curr) => {
      if (acc.text !== '') {
        return { ...acc, text: `${acc.text}\n${curr}` };
      }
      const match = curr.match(/^@[a-zA-Z][a-zA-Z0-9_]*($|\s)/);
      if (!match) {
        return { ...acc, text: curr };
      }
      const key = match[0].substr(1).trim();
      const value = match[0] === curr ? true : curr.replace(match[0], '');
      const currentValue = acc.tags[key];
      acc.tags[key] =
        typeof currentValue === 'undefined'
          ? value
          : Array.isArray(currentValue)
          ? [...currentValue, value]
          : [currentValue, value];
      return acc;
    },
    {
      tags: {} as Record<string, string | boolean | (string | boolean)[]>,
      text: '',
    },
  );
};
