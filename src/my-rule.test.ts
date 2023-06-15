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
  }, {
    code: '<Button className="flex items-center" />'
  }],
  invalid: [
    {
      code: '<Button variant="secondary" />',
      output: '<Button variant="new-secondary" />',
      errors: [{ messageId: 'secondaryVariantFailureId' }],
    },
    {
      code: '<Button className="d-flex position-relative position-absolute" />',
      output: '<Button className="flex relative absolute" />',
      errors: [{ messageId: 'tailwindFailureId' }],
    },
    {
      code: `<Button className={cx('d-flex position-relative', 'position-absolute')} />`,
      output: `<Button className={cx('flex relative', 'absolute')} />`,
      errors: [{ messageId: 'tailwindFailureId' }],
    },
    {
      code: `<Button className={cx('d-flex position-relative', {
        'position-absolute': true
      })} />`,
      output: `<Button className={cx('flex relative', {
        'position-absolute': true
      })} />`,
      errors: [{ messageId: 'tailwindFailureId' }],
    },
    {
      code: '<div className="d-flex text-white font-weight-400 w-100" />',
      output: '<div className="flex text-white font-normal w-full" />',
      errors: [{ messageId: 'tailwindFailureId' }],
    },
  ],
});


