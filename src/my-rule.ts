import { TSESLint } from '@typescript-eslint/utils';
// @ts-ignore
import { elementType, getPropValue, propName } from 'jsx-ast-utils';

type MessageIds = 'messageIdForFailure';

const PROP_TO_VALIDATE = 'variant';
const PROP_VALUE = 'secondary';
const PROP_FIX = 'new-secondary';

const myRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    messages: {
      messageIdForFailure: 'You should migrate to new-secondary',
    },
    fixable: 'code',
    schema: [], // no options
  },
  create: (context) => ({
    JSXAttribute: (node) => {
      const { parent } = node;
      // Extract a component name when using a "namespace", e.g. `<AntdLayout.Content />`.
      const tag = elementType(parent);

      if (tag !== 'Button') {
        return;
      }

      const propValue = getPropValue(node);
      const propNameString = propName(node);

      if (propNameString === PROP_TO_VALIDATE
        && propValue === PROP_VALUE) {
        return context.report({
          node,
          messageId: 'messageIdForFailure',
          fix(fixer) {
            return fixer.replaceTextRange(node.value!.range, `"${PROP_FIX}"`);
          }
        });
      }
    }
  }),
};

export default myRule;
