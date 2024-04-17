module.exports = {
  rules: {
    /*
      Snap style is single quotes, except where they can be used to avoid having to escape a quote
     */
    '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    /*
      If one property in an object literal is quoted, they all should be.
     */
    'quote-props': ['error', 'consistent'],
    /*
      Require consistent usage of linebreaks for each pair of brackets. It reports an error if one
        bracket in the pair has a linebreak inside it and the other bracket does not.
     */
    'array-bracket-newline': ['error', 'consistent'],
    'array-element-newline': ['error', 'consistent'],

    'block-spacing': ['error', 'always'],
    'brace-style': 'off',
    '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': 'error',
    'comma-style': 'error',

    //TODO should we enforce arrow-body-style?
    'arrow-body-style': 'off',
    // 'arrow-body-style': ['error', 'as-needed'],

    //TODO Do the offs belong here or recommended?
    'computed-property-spacing': 'error',
    'eol-last': 'error',
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': 'error',
    'function-call-argument-newline': ['error', 'consistent'],

    //TODO Look into enabling once @typescript-eslint #942 is fixed
    //'function-paren-newline': 'error',

    //TODO Look into enabling once @typescript-eslint #1824 is fixed
    //Sadly this is too broken in too many cases for use to support
    //  you can use ignoredNodes to work around it's bugs, but we
    //  can't support an exhaustive ignore list.
    'indent': 'off',
    '@typescript-eslint/indent': 'off',

    'key-spacing': 'error',

    'keyword-spacing': 'off',
    '@typescript-eslint/keyword-spacing': 'error',

    /*
      Considered adding this, but would prefer it if we could only require lines
        after methods.
     */
    'lines-between-class-members': 'off',
    //'@typescript-eslint/lines-between-class-members': ['error', 'always', {exceptAfterSingleLine: true}],

    'new-parens': 'error',

    /*
      Considered this rule, but it doesn't take account line breaks within a chain, which would require extra lines
      for some code that still ends up with each function call being on it's own line.
     */
    // 'newline-per-chained-call': ['error', {ignoreChainWithDepth: 3}],

    'no-lonely-if': 'off',
    'no-mixed-operators': ['error', { allowSamePrecedence: true }],
    'no-whitespace-before-property': 'error',
    'object-curly-newline': 'error',
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    'operator-linebreak': ['error', 'before'],
    'semi': 'off',
    '@typescript-eslint/semi': 'error',
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'space-infix-ops': 'off',
    '@typescript-eslint/space-infix-ops': 'error',
    'switch-colon-spacing': 'error',
    'template-tag-spacing': 'error',
    'arrow-spacing': 'error',

    'rest-spread-spacing': 'error',
    'template-curly-spacing': 'error',

    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: true,
        },
      },
    ],
  },
};
