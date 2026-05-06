import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".venv/**",
      ".pytest-tmp/**",
      ".pytest-tmp-s2t6/**",
      "pytest-tmp*/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
