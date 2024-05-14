import globals from 'globals'
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    ignores: ['dist/*']
  },
  {
    languageOptions: {
      globals: globals.node
    }
  }
]
