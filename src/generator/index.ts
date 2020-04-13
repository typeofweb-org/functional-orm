import { db } from './db';
import { TableSchema, ColumnType } from './types';
import { Table } from '..';
import Prettier from 'prettier';
import { defaults, flatMap } from 'lodash';
import { makeIntrospectionQuery } from './introspectionQuery';
import { xByY, xByYAndZ, parseTags } from './utils';

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class NotSupportedError extends Error {
  message = 'NotSupportedError';
}

// Ref: https://github.com/graphile/postgraphile/tree/master/src/postgres/introspection/object

type PgNamespace = {
  kind: 'namespace';
  id: string;
  name: string;
  description?: string;
  comment?: string;
  tags: Record<string, string | boolean | (string | boolean)[]>;
};

type PgProc = {
  kind: 'procedure';
  id: string;
  name: string;
  description?: string;
  comment?: string;
  namespaceId: string;
  namespaceName: string;
  isStrict: boolean;
  returnsSet: boolean;
  isStable: boolean;
  returnTypeId: string;
  argTypeIds: Array<string>;
  argNames: Array<string>;
  argModes: Array<'i' | 'o' | 'b' | 'v' | 't'>;
  inputArgsCount: number;
  argDefaultsNum: number;
  namespace: PgNamespace;
  tags: Record<string, string | boolean | (string | boolean)[]>;
  cost: number;
  aclExecutable: boolean;
  language: string;
};

type PgClass = {
  kind: 'class';
  id: string;
  name: string;
  description?: string;
  comment?: string;
  classKind: string;
  namespaceId: string;
  namespaceName: string;
  typeId: string;
  isSelectable: boolean;
  isInsertable: boolean;
  isUpdatable: boolean;
  isDeletable: boolean;
  isExtensionConfigurationTable: boolean;
  namespace: PgNamespace;
  type: PgType;
  tags: Record<string, string | boolean | (string | boolean)[]>;
  attributes: Array<PgAttribute>;
  constraints: Array<PgConstraint>;
  foreignConstraints: Array<PgConstraint>;
  primaryKeyConstraint?: PgConstraint;
  aclSelectable: boolean;
  aclInsertable: boolean;
  aclUpdatable: boolean;
  aclDeletable: boolean;
  canUseAsterisk: boolean;
};

type PgType = {
  kind: 'type';
  id: string;
  name: ColumnType;
  description?: string;
  comment?: string;
  namespaceId: string;
  namespaceName: string;
  type: string;
  category: string;
  domainIsNotNull: boolean;
  arrayItemTypeId?: string;
  arrayItemType?: PgType;
  arrayType?: PgType;
  typeLength?: number;
  isPgArray: boolean;
  classId?: string;
  class?: PgClass;
  domainBaseTypeId?: string;
  domainBaseType?: PgType;
  domainTypeModifier?: number;
  tags: Record<string, string | boolean | (string | boolean)[]>;
};

type PgAttribute = {
  kind: 'attribute';
  classId: string;
  num: number;
  name: string;
  description?: string;
  comment?: string;
  typeId: string;
  typeModifier: number;
  isNotNull: boolean;
  hasDefault: boolean;
  identity: '' | 'a' | 'd';
  class: PgClass;
  type: PgType;
  namespace: PgNamespace;
  tags: Record<string, string | boolean | (string | boolean)[]>;
  aclSelectable: boolean;
  aclInsertable: boolean;
  aclUpdatable: boolean;
  isIndexed?: boolean;
  isUnique?: boolean;
  columnLevelSelectGrant: boolean;
};

type PgConstraint = {
  kind: 'constraint';
  id: string;
  name: string;
  type: string;
  classId: string;
  class: PgClass;
  foreignClassId?: string;
  foreignClass?: PgClass;
  description?: string;
  comment?: string;
  keyAttributeNums: Array<number>;
  keyAttributes: Array<PgAttribute>;
  foreignKeyAttributeNums: Array<number>;
  foreignKeyAttributes: Array<PgAttribute>;
  namespace: PgNamespace;
  isIndexed?: boolean;
  tags: Record<string, string | boolean | (string | boolean)[]>;
};

type PgExtension = {
  kind: 'extension';
  id: string;
  name: string;
  namespaceId: string;
  namespaceName: string;
  relocatable: boolean;
  version: string;
  configurationClassIds?: Array<string>;
  description?: string;
  comment?: string;
  tags: Record<string, string | boolean | (string | boolean)[]>;
};

type PgIndex = {
  kind: 'index';
  id: string;
  name: string;
  namespaceName: string;
  classId: string;
  numberOfAttributes: number;
  indexType: string;
  isUnique: boolean;
  isPrimary: boolean;
  /*
  Though these exist, we don't want to officially
  support them yet.
  isImmediate: boolean,
  isReplicaIdentity: boolean,
  isValid: boolean,
  */
  isPartial: boolean;
  attributeNums: Array<number>;
  attributePropertiesAsc?: Array<boolean>;
  attributePropertiesNullsFirst?: Array<boolean>;
  description?: string;
  comment?: string;
  tags: Record<string, string | boolean | (string | boolean)[]>;
};

type PgEntity =
  | PgNamespace
  | PgProc
  | PgClass
  | PgType
  | PgAttribute
  | PgConstraint
  | PgExtension
  | PgIndex;

type PgIntrospectionOriginalResultsByKind = {
  __pgVersion: number;
  attribute: PgAttribute[];
  class: PgClass[];
  constraint: PgConstraint[];
  extension: PgExtension[];
  index: PgIndex[];
  namespace: PgNamespace[];
  procedure: PgProc[];
  type: PgType[];
};

type PgIntrospectionResultsByKind = PgIntrospectionOriginalResultsByKind & {
  attributeByClassIdAndNum: {
    [classId: string]: { [num: string]: PgAttribute };
  };
  classById: { [classId: string]: PgClass };
  extensionById: { [extId: string]: PgExtension };
  namespaceById: { [namespaceId: string]: PgNamespace };
  typeById: { [typeId: string]: PgType };
};

export async function getPostgresVersion(): Promise<number> {
  const versionResult = await db.one('show server_version_num;');
  return Number.parseInt(versionResult.server_version_num, 10);
}

export async function runIntrospectionQuery(): Promise<PgIntrospectionResultsByKind> {
  const version = await getPostgresVersion();
  const sql = makeIntrospectionQuery(version);
  const kinds = [
    'namespace',
    'class',
    'attribute',
    'type',
    'constraint',
    'procedure',
    'extension',
    'index',
  ] as const;
  type Kinds = PgEntity['kind'];
  type Row = {
    object: PgEntity;
  };
  const rows: Row[] = await db.many(sql, [['public'], false]);

  const originalResultsByType: PgIntrospectionOriginalResultsByKind = {
    __pgVersion: version,
    namespace: [],
    class: [],
    attribute: [],
    type: [],
    constraint: [],
    procedure: [],
    extension: [],
    index: [],
  };

  for (const { object } of rows) {
    originalResultsByType[object.kind].push(object as any);
  }

  // Parse tags from comments
  kinds.forEach((kind) => {
    originalResultsByType[kind].forEach((object: PgIntrospectionResultsByKind[Kinds][number]) => {
      // Keep a copy of the raw comment
      object.comment = object.description;
      // https://www.graphile.org/postgraphile/smart-comments/
      if (object.description) {
        const parsed = parseTags(object.description);
        object.tags = parsed.tags;
        object.description = parsed.text;
      } else {
        object.tags = {};
      }
    });
  });

  const extensionConfigurationClassIds = flatMap(
    originalResultsByType.extension,
    (e) => e.configurationClassIds,
  );
  originalResultsByType.class.forEach((pgClass) => {
    pgClass.isExtensionConfigurationTable = extensionConfigurationClassIds.includes(pgClass.id);
  });

  kinds.forEach((k) => {
    originalResultsByType[k].forEach(Object.freeze);
  });

  const result = originalResultsByType as PgIntrospectionResultsByKind;
  result.namespaceById = xByY(originalResultsByType.namespace, 'id');
  result.classById = xByY(originalResultsByType.class, 'id');
  result.typeById = xByY(originalResultsByType.type, 'id');
  result.attributeByClassIdAndNum = xByYAndZ(originalResultsByType.attribute, 'classId', 'num');
  result.extensionById = xByY(originalResultsByType.extension, 'id');

  return Object.freeze(result);
}

export async function introspectSchemas() {
  const intro = await runIntrospectionQuery();
  const namespaceIds = intro.namespace.map((n) => n.id);
  const classes = intro.class.filter((c) => namespaceIds.includes(c.namespaceId));
  return { classes, intro };
}

export async function getTablesSchemas(): Promise<Array<TableSchema>> {
  const { classes, intro } = await introspectSchemas();

  return classes.map((klass) => {
    return {
      tableName: klass.name,
      schema: Object.values(intro.attributeByClassIdAndNum[klass.id]).map((attribute) => {
        return {
          column_name: attribute.name,
          udt_name: intro.typeById[attribute.typeId].name,
          is_nullable: attribute.isNotNull ? 'NO' : 'YES',
        };
      }),
    };
  });
}

export function schemaToTableObj(schema: TableSchema): Table {
  return {
    name: schema.tableName,
    columns: Object.fromEntries(
      schema.schema.map((s) => {
        return [s.column_name, { type: s.udt_name, notNull: s.is_nullable === 'NO' }];
      }),
    ),
  };
}

export function tableObjToTSCode(table: Table, opts?: Prettier.Options): string {
  const typeName = table.name.slice(0, 1).toLocaleUpperCase() + table.name.slice(1);
  const code = `export const ${typeName} = ${JSON.stringify(table)} as const;`;

  const defaultOptions: Prettier.Options = {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
  } as const;
  const options = defaults({}, opts, defaultOptions);
  return Prettier.format(code, {
    ...options,
    parser: 'typescript',
  });
}

export async function generateTSCodeForAllSchema() {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const schemas = await getTablesSchemas();
  const allModelsCode = schemas
    .map(schemaToTableObj)
    .map((obj) => tableObjToTSCode(obj))
    .join('\n');

  return `
/**
 * AUTOMATICALLY GENERATED
 * DO NOT MODIFY
 * ANY CHANGES WILL BE OVERWRITTEN
 */

${allModelsCode}`.trimStart();
}
