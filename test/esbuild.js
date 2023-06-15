import esbuild from 'esbuild';
import { resolve } from 'node:path';

const OUTFILE = resolve('test/jsx.test.js');
const ENTRY = resolve('test/jsx.jsx');

/** @type {esbuild.BuildOptions} **/
const cfg = {
  format: 'esm',
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: false,
  minify: false,
  sourcemap: false,
  jsxFactory: 'm',
  jsxFragment: '"["'
};

// create & configure context
const ctx = await esbuild.context(cfg);
ctx.rebuild().finally(ctx.dispose);