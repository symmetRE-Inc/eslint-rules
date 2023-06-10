import { TSESLint } from '@typescript-eslint/utils';
// @ts-ignore
import { elementType, getPropValue, propName } from 'jsx-ast-utils';
import { OLD_CLASSES_TO_TAILWIND } from './config';

type MessageIds = 'secondaryVariantFailureId' | 'tailwindFailureId';

const PROP_TO_VALIDATE = 'variant';
const PROP_VALUE = 'secondary';
const PROP_FIX = 'new-secondary';

const myRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    messages: {
      secondaryVariantFailureId: 'You should migrate to new-secondary',
      tailwindFailureId: 'You should migrate to {{newClass}}',
    },
    fixable: 'code',
    schema: [], // no options
  },
  create: (context) => ({
    JSXAttribute: (node) => {
      const { parent } = node;
      // Extract a component name when using a "namespace", e.g. `<AntdLayout.Content />`.
      const tag = elementType(parent);


      const propValue = getPropValue(node);
      const propNameString = propName(node);

      // migration to new-secondary
      if (propNameString === PROP_TO_VALIDATE
        && propValue === PROP_VALUE
        && tag === 'Button') {
        return context.report({
          node,
          messageId: 'secondaryVariantFailureId',
          fix(fixer) {
            return fixer.replaceTextRange(node.value!.range, `"${PROP_FIX}"`);
          }
        });
      }

      // migration to tailwind
      if (propNameString === 'className'
        && Object.keys(OLD_CLASSES_TO_TAILWIND).some(k => propValue.includes(k))) {


        return context.report({
          node,
          messageId: 'tailwindFailureId',
          fix(fixer) {
            let newValue = propValue;
            Object.entries(OLD_CLASSES_TO_TAILWIND)
              .filter(([oldClass, newClass]) => propValue.includes(oldClass) && newClass != null)
              .forEach(([oldClass, newClass]) => {
                newValue = newValue.replace(oldClass, newClass);
            });
            return fixer.replaceTextRange(node.value!.range, `"${newValue}"`);
          }
        });
      }
    }
  }),
};

export default myRule;
