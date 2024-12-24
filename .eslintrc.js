module.exports = {
  extends: require.resolve('umi/eslint'),
  root: true,
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/order': 'off',
    'import/prefer-default-export': 'off',
    'global-require': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
