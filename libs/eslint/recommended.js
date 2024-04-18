module.exports = {
  //Either re-enable when plugin is fixed, or switch to fork.
  // https://github.com/gund/eslint-plugin-deprecation/issues/37
  plugins: ['deprecation'],
  rules: {
    'deprecation/deprecation': 'error',
    /*
      Mainly included for objectLiteralTypeAssertions to encourage typing variables or using asA().
    */
    //TODO Need to open an issue with typescript eslint.  Turned off for params after running into an issue with
    //  this code:
    //   combineLatest([
    //     this.mainForm.statusChanges.pipe(
    //     startWith(this.mainForm.status),
    //     filter(status => status !== 'PENDING'),
    //     take(1)
    //     ) as Observable<'VALID' | 'INVALID'>, //This errored even though it would be Observable<any> without the cast.
    //     this.route.parent?.params.pipe(take(1)) ?? of({}),
    //     this.beService.getAll<ProjectType>('project-types')
    //   ]).subscribe(...)
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter' },
    ],
    /*
      Snap feels like it's a valid stylistic choice.  Especially when doing maps of things like
        Roles to allowed actions, etc.
     */
    '@typescript-eslint/dot-notation': 'off',
    /*
      With components so much is public this isn't worth the effort.
     */
    '@typescript-eslint/explicit-member-accessibility': 'off',
    /*
      Components trigger this too often to be useful.
     */
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    /*
      Snap finds this to be too limiting, especially when grouping getter/setter and backing private property.
     */
    '@typescript-eslint/member-ordering': 'off',
    /*
      Unfortunately the implementation of this makes it very hard to have constant object literals where
        the keys do not meet the name convention.  This interferes with things like allowed actions maps,
        code -> description maps, etc.
     */
    '@typescript-eslint/naming-convention': 'off',
    /*
      We find this rule to limiting, especially when working with SnapCodes that have a useful toString()
        by design.
     */
    '@typescript-eslint/restrict-plus-operands': 'off',
    /*
      We find this rule to limiting, especially when working with SnapCodes that have a useful toString()
        by design.
     */
    '@typescript-eslint/restrict-template-expressions': 'off',

    '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],

    /*
      Prevents leaving unused imports, variables, parameters etc. to clutter and confuse code.

      If it is intentionally unused you can add an _ to the begining of the name to indicate it
        is intentional.
     */
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],

    /*
      We find we do this too often to convert possibly Truthy values to definitely boolean values.
     */
    'no-extra-boolean-cast': 'off',
    //Using _ for public 'private' properties will conflict with the unused vars rule.
    //  But you should only be doing that on public identifiers, which are considered used since
    //  they are part of the class's public api.
    /*
      Because components have to make properties/methods public for their templates, it is often convention
        in libraries to use _name to indicate properties/methods that shouldn't be used outside of their templates.
     */
    'no-underscore-dangle': 'off',
    /*
      We feel this is a stylistic choice not worth enforcing.
     */
    'object-shorthand': 'off',
    /*
      We feel this is too extensive and blocks to many legitimate uses of functions.
     */
    'prefer-arrow/prefer-arrow-functions': 'off',

    /*
      Meant to reduce the explicit usage of the 'any' type. This doesn't stop you from using
        properties, functions, etc that return/take any.

      If you want to further restrict how any is used in your project consider adding the
        recommended-strict-safe-any rule set.
     */
    '@typescript-eslint/no-explicit-any': 'error',

    //Strict 'any' rules that will get turned back on in recommended-strict-safe-any.js
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
  },
};
