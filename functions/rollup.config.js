import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";

const plugins = [
  typescript({
    tsconfig: "./tsconfig-build.json",
  }),
  json(),
  commonjs(),
  replace({
    preventAssignment: true,
    "process.env.ENABLE_SYNTACTIC_SUGAR": JSON.stringify(
      process.env.ENABLE_SYNTACTIC_SUGAR
    ),
  }),
];

function makeEntryPointFor(input) {
  return {
    input,
    output: {
      dir: "dist",
      format: "cjs",
    },
    plugins,
  };
}

export default [makeEntryPointFor("./lambdas/origin-request.ts")];
