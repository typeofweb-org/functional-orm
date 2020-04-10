#!/usr/bin/env node
import Path from 'path';
import Fs from 'fs';

const pkgPath = Path.resolve(process.cwd(), 'package.json');
if (!Fs.existsSync(pkgPath)) {
  throw new Error(
    'package.json not found! Run this command in the root directory of your project.',
  );
}

// const pkg = require(pkgPath);

// const config = {};
