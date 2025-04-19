import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    // 👇 Add this block to override rules
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // 💡 downgrade error to warning
    },
  },
];

export default eslintConfig;
