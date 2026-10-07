import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig([
    {
        ignores: ["node_modules/", "main.js"],
    },
    ...obsidianmd.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ["**/*.mjs"],
        ...tseslint.configs.disableTypeChecked,
    },
    {
        files: ["**/*.mjs"],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
