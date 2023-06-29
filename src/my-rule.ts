import { ESLintUtils } from '@typescript-eslint/utils';
import * as ts from 'typescript';
// @ts-ignore
import { OLD_CLASSES_TO_TAILWIND } from './config';
import { elementType, } from "./utils/jsx-ast";
import { getRangeExcludeQuotes } from "./utils";

type MessageIds = 'secondaryVariantFailureId' | 'tailwindFailureId';
const PROP_TO_VALIDATE = 'variant';
const PROP_VALUE = 'secondary';
const PROP_FIX = 'new-secondary';

const createRule = ESLintUtils.RuleCreator.withoutDocs;

const myRule = createRule<[],MessageIds>({
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
      if (node.value == null) {
        return;
      }
      // 1. Grab the TypeScript program from parser services
      const parserServices = ESLintUtils.getParserServices(context);
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node.value)

      const { parent } = node;
      // Extract a component name when using a "namespace", e.g. `<AntdLayout.Content />`.
      const tag = elementType(parent);


      const propValue = ts.createPrinter().printNode(ts.EmitHint.Unspecified, originalNode, originalNode.getSourceFile())
      const propNameString = node.name.name;
      // migration to new-secondary
      if (propNameString === PROP_TO_VALIDATE
        && (node.value! as any).value === PROP_VALUE
        && tag === 'Button') {
        return context.report({
          node,
          messageId: 'secondaryVariantFailureId',
          fix(fixer) {
            return fixer.replaceTextRange(getRangeExcludeQuotes(node.value!), `${PROP_FIX}`);
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

        return context.report({
          node,
          messageId: 'tailwindFailureId',
          fix(fixer) {
            if (node.value!.type === 'JSXExpressionContainer'
              && node.value!.expression.type === 'CallExpression'
            ) {
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

            const { expression } = node.value! as any;
            if (expression != null && expression.type === 'TemplateLiteral') {
              return null;
            }

            return fixer.replaceTextRange(
              node.value!.range,
              replaceOldClasses(propValue));
          }
        });
      }
    }
  }),
});

export default myRule;
