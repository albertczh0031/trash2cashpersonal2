// eslint.config.js
import nextConfig from '@next/eslint-plugin-next/config';
import babelParser from '@babel/eslint-parser';

export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    ignores: [".next/**", "node_modules/**"],

    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
    },

    plugins: {
      react: require('eslint-plugin-react'),
    },

    rules: {
      ...nextConfig.recommended.rules,
      ...nextConfig['core-web-vitals'].rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
