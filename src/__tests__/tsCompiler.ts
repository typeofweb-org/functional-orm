import Fs from 'fs';
import Path from 'path';
import TS from 'typescript';

export function compileTypeScriptCode(contents: string) {
  const compilerOptions: TS.CompilerOptions = {
    noEmitOnError: false,
    strict: true,
    module: TS.ModuleKind.CommonJS,
    target: TS.ScriptTarget.ESNext,
  };
  const outputs: Array<{ name: string; text: string; writeByteOrderMark: boolean }> = [];
  const compilerHost: TS.CompilerHost = {
    getSourceFile(filename, languageVersion) {
      if (filename === 'file.ts') return TS.createSourceFile(filename, contents, languageVersion);
      if (filename.startsWith('lib.') && filename.endsWith('.d.ts')) {
        const libSource = Fs.readFileSync(
          Path.join(Path.dirname(require.resolve('typescript')), filename),
          'utf-8',
        );
        return TS.createSourceFile(filename, libSource, languageVersion);
      }
      return undefined;
    },
    readFile(filename) {
      if (filename === 'file.ts') return contents;
      if (filename.startsWith('lib.') && filename.endsWith('.d.ts')) {
        const libSource = Fs.readFileSync(
          Path.join(Path.dirname(require.resolve('typescript')), filename),
          'utf-8',
        );
        return libSource;
      }
      return undefined;
    },
    writeFile(name, text, writeByteOrderMark) {
      outputs.push({ name, text, writeByteOrderMark });
    },
    fileExists(filename) {
      if (filename === 'file.ts') return true;
      if (filename === 'lib.d.ts') return true;
      return false;
    },
    getDefaultLibFileName() {
      return 'lib.d.ts';
    },
    useCaseSensitiveFileNames() {
      return false;
    },
    getCanonicalFileName(filename) {
      return filename;
    },
    getCurrentDirectory() {
      return '';
    },
    getNewLine() {
      return '\n';
    },
  };
  const program = TS.createProgram(['file.ts'], compilerOptions, compilerHost);
  const emitResult = program.emit();

  const allDiagnostics = TS.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  const errors = allDiagnostics.map((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const message = TS.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
    } else {
      return TS.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    }
  });

  return {
    outputs,
    errors,
  };
}
