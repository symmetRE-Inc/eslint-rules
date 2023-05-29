import { ESLintUtils } from '@typescript-eslint/utils';

import myRule from './my-rule';

const parserResolver = require.resolve('@typescript-eslint/parser');

const ruleTester = new ESLintUtils.RuleTester({
  parser: parserResolver as any, // yarn 2+ shenanigans
  parserOptions: { ecmaFeatures: { jsx: true } }
});

ruleTester.run('my-rule', myRule, {
  valid: [{
    code: '<Button variant="primary" />'
  }],
  invalid: [
    {
      code: '<Button variant="secondary" />',
      output: '<Button variant="new-secondary" />',
      errors: [{ messageId: 'messageIdForFailure' }],
    },
  ],
});
