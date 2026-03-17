import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  {
    ignores: ['dashboard/**', 'rust-v2/**', 'dist/**', 'node_modules/**', 'docs/**'],
  },
  js.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        URL: 'readonly',
        WebSocket: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        crypto: 'readonly',
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  prettier,
]
