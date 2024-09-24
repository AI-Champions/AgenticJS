import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.TEST_ENV === "mocked-llm-apis";

function generateConfig(format) {
  const isDTS = format === "dts";
  const isESM = format === "es";
  const isCJS = format === "cjs";
  const ext = isESM ? "mjs" : isCJS ? "cjs" : "js";
  const external = isESM
    ? ["react", "react-dom", "uuid", "pino", "pino-pretty"]
    : ["uuid", "pino", "pino-pretty"];

  if (isDTS) {
    return {
      input: "./types/index.d.ts",
      output: [
        {
          file: "dist/bundle.d.ts",
          format: "es",
        },
      ],
      plugins: [dts()],
    };
  }

  return {
    input: "src/index.js",
    output: {
      file: `dist/bundle.${ext}`,
      format: format,
      inlineDynamicImports: true,
      sourcemap: true,
      name: format === "umd" ? "KaibanJS" : undefined,
    },
    external: external,
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
        mainFields: ["browser", "module", "main"],
      }),
      commonjs(),
      ...(isTest
        ? [
            replace({
              "shims.fetch": `(...args) => { return global.fetch(...args); };\n`,
              preventAssignment: true,
            }),
          ]
        : []),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
      }),
      ...(!isDevelopment ? [terser()] : []),
    ],
  };
}

export default [
  generateConfig("cjs"),
  generateConfig("es"),
  generateConfig("umd"),
  generateConfig("dts"),
];
