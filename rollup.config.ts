import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const config = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  plugins: [
    resolve(),
    typescript(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),
    commonjs(),
    terser(),
    sizeSnapshot(),
  ],
  external: [...Object.keys(pkg.devDependencies)],
};

export default config;
