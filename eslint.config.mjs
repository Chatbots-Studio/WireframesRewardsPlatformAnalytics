import nextConfig from 'eslint-config-next/core-web-vitals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  ...nextConfig,
  {
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    languageOptions: {
      parser: tsParser
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'no-console': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
