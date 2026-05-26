import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills'; // Correct plugin name
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

// Array of tool folder names
const toolFolders = [
  'firecrawl',
  'tavily',
  'serper',
  'exa',
  'wolfram-alpha',
  'github-issues',
  'simple-rag',
  'website-search',
  'pdf-search',
  'textfile-search',
  'zapier-webhook',
  'make-webhook',
  'jina-url-to-markdown',
  'simple-rag-retrieve',
  'perplexity-search',
]; // Add more folder names as needed

const toolConfigs = toolFolders.map((tool) => {
  const inputPath = `src/${tool}/index.ts`;

  return defineConfig({
    input: inputPath,
    output: [
      {
        file: `dist/${tool}/index.cjs.js`,
        format: 'cjs',
        sourcemap: false,
        inlineDynamicImports: true,
      },
      {
        file: `dist/${tool}/index.esm.js`,
        format: 'esm',
        sourcemap: false,
        inlineDynamicImports: true,
      },
    ],
    external: [
      'pdf-parse',
      'pdfjs-dist',
      'pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js',
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: `dist/${tool}/`,
        outDir: `./dist/${tool}`,
        rootDir: `./src/${tool}/`,
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false, // Use polyfills for Node built-in modules
        extensions: ['.ts', '.js', '.json'],
        moduleDirectories: ['node_modules', 'src'],
        preserveSymlinks: true,
      }),
      commonjs(),
      json(),
      nodePolyfills(), // Correctly named polyfill plugin for Node.js
      terser(),
      replace({
        preventAssignment: true,
        values: {
          'node:fs/promises': 'fs/promises',
          'Promise.withResolvers':
            '(() => ({ promise: new Promise(() => {}), resolve: () => {}, reject: () => {} }))',
        },
      }),
    ],
  });
});

// Main index config
const mainConfig = defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: false,
      inlineDynamicImports: true,
    },
  ],
  external: [
    'pdf-parse',
    'pdfjs-dist',
    'pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: `./dist/`,
      rootDir: './src/',
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    nodePolyfills(),
    terser(),
    replace({
      preventAssignment: true,
      values: {
        'node:fs/promises': 'fs/promises',
        'Promise.withResolvers':
          '(() => ({ promise: new Promise(() => {}), resolve: () => {}, reject: () => {} }))',
      },
    }),
  ],
});

const ragToolkitConfig = defineConfig({
  input: 'src/_utils/rag/ragToolkit.ts',
  output: [
    {
      file: 'dist/rag-toolkit/index.cjs.js',
      format: 'cjs',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/rag-toolkit/index.esm.js',
      format: 'esm',
      sourcemap: false,
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/rag-toolkit/',
      rootDir: './src/_utils/rag/',
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    nodePolyfills(),
    terser(),
    replace({
      preventAssignment: true,
      values: {
        'node:fs/promises': 'fs/promises',
        'Promise.withResolvers':
          '(() => ({ promise: new Promise(() => {}), resolve: () => {}, reject: () => {} }))',
      },
    }),
  ],
});

export default [ragToolkitConfig, ...toolConfigs, mainConfig];
