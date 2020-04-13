#!/usr/bin/env node
import Path from 'path';
import Fs from 'fs';
import { getDbConnection, pgp } from './generator/db';
import { generateTSCodeForAllSchemas } from './generator';

const pkgPath = Path.resolve(process.cwd(), 'package.json');
if (!Fs.existsSync(pkgPath)) {
  throw new Error(
    'package.json not found! Run this command in the root directory of your project.',
  );
}

const connectionOptions = {
  user: 'test',
  database: 'test',
  password: 'test',
};

const outputFilename = 'generated/models.ts';

function ensureDirectoryExistence(filePath: string) {
  const dirname = Path.dirname(filePath);
  if (Fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExistence(dirname);
  Fs.mkdirSync(dirname);
}

(async () => {
  const db = getDbConnection(connectionOptions);
  const schemas = await generateTSCodeForAllSchemas(db);
  pgp.end();
  console.log(schemas);

  ensureDirectoryExistence(outputFilename);
  Fs.writeFileSync(outputFilename, schemas, 'utf8');
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
