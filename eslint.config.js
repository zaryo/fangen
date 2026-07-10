import eslint from "@eslint/js";
import tsPattern from "@danilqa/eslint-plugin-ts-pattern";
import tseslint from "typescript-eslint";

const eslintConfig = {
  ...eslint.configs.recommended,
};

eslintConfig.rules = {
  ...eslintConfig.rules,

  "no-restricted-syntax": [
    "error",
    {
      selector: "SwitchStatement",
      message:
        "Do not use switch statements. Use ts-pattern match() instead for better type safety.",
    },
    {
      selector: "IfStatement > IfStatement > IfStatement",
      message:
        "Deeply nested if/else chains detected. Consider refactoring to ts-pattern match().",
    },
  ],
  "no-ternary": "error",
  "no-with": "error",
  "prefer-const": "error",
  "prefer-template": "error",
};

export default tseslint.config({
  extends: [eslintConfig, tseslint.configs.strictTypeChecked],
  files: ["src/**/*.ts"],
  ignores: ["src/test/**/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  plugins: {
    "ts-pattern": tsPattern,
  },
  rules: {
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {"ts-ignore": "allow-with-description"},
    ],
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-invalid-void-type": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {checksVoidReturn: {arguments: false}},
    ],
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      {allowNumber: true},
    ],
    "ts-pattern/prefer-match-on-union": "error",
  },
});
