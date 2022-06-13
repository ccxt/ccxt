'use strict';

module.exports = {
  "env": {
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "script",
  },
  "extends": ["eslint:recommended"],
  "rules": {
      "semi": ["error", "never"],
      "no-unused-vars": ["off"],
      "quotes": ["off", "single"],
      "func-call-spacing": ["error", "always"],
      "one-var": "off",
      "indent": ["error", 4],
      "comma-style": "off",
      "no-multi-spaces": "off",
      "comma-dangle": "off",
      "spaced-comment": "off",
      "camelcase": "off",
      "padded-blocks": "off",
      "multiline-comment-style": "off",
      "curly": "off",
      "rest-spread-spacing": "off",
      "no-multiple-empty-lines": "off",
      "no-undef-init": "off",
      "no-useless-return": "off",
      "no-console": "off",
      "operator-linebreak": "off",
      "key-spacing": "off",
      "brace-style": "off",
      "padding-line-between-statements": ["off",
        { "blankLine": "always", "prev":"function", "next": "*" },
        { "blankLine": "always", "prev":"directive", "next": "*" },
        { "blankLine": "always", "prev":"*", "next": "cjs-export" },
      ],
      "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
    },
}
