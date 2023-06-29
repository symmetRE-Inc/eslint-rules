// @ts-ignore
function resolveMemberExpressions(object: any, property: any) {
  if (object.type === 'JSXMemberExpression') {
    return resolveMemberExpressions(object.object, object.property) + '.' + property.name;
  }

  return object.name + '.' + property.name;
}

/**
 * Returns the tagName associated with a JSXElement.
 */
export function elementType(node: any) {
  var name = node.name;


  if (node.type === 'JSXOpeningFragment') {
    return '<>';
  }

  if (!name) {
    throw new Error('The argument provided is not a JSXElement node.');
  }

  if (name.type === 'JSXMemberExpression') {
    var _name$object = name.object,
      object = _name$object === undefined ? {} : _name$object,
      _name$property = name.property,
      property = _name$property === undefined ? {} : _name$property;

    return resolveMemberExpressions(object, property);
  }

  if (name.type === 'JSXNamespacedName') {
    return name.namespace.name + ':' + name.name.name;
  }

  return node.name.name;
}
