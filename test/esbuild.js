import esbuild from 'esbuild';
import { resolve } from 'node:path';

const OUTFILE = resolve('test/jsx.test.js');
const ENTRY = resolve('test/jsx.jsx');

/** @type {esbuild.BuildOptions} **/
const options = {
  format: 'esm',
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: false,
  minify: false,
  sourcemap: false,
  jsxFactory: 'm',
  jsxFragment: '"["'
};

esbuild.buildSync(options);
