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
        const replaceOldClasses = (classValue: string) => Object.entries(OLD_CLASSES_TO_TAILWIND)
          .filter(([oldClass, newClass]) => classValue.includes(oldClass) && newClass != null)
          .reduce((acc, [oldClass, newClass]) => {
            return acc.replace(oldClass, newClass!);
          }, classValue);
        const getRangeExcludeQuotes = (node: any): [number, number] => [node.range[0] + 1, node.range[1] - 1];

        return context.report({
          node,
          messageId: 'tailwindFailureId',
          fix(fixer) {
            if (node.value!.type === 'JSXExpressionContainer') {
              const { expression } = node.value! as any;
              return expression.arguments
                // @ts-ignore
                .filter(arg => arg.type === 'Literal' || arg.type === 'TemplateLiteral')
                // @ts-ignore
                .map((arg) => {
                  return fixer.replaceTextRange(
                    getRangeExcludeQuotes(arg),
                    replaceOldClasses(arg.value)
                  );

              })
            }

            return fixer.replaceTextRange(
              getRangeExcludeQuotes(node.value!),
              replaceOldClasses(propValue));
          }
        });
      }
    }
  }),
};

export default myRule;
