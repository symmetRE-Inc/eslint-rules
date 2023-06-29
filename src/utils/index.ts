export const getRangeExcludeQuotes = (node: any): [number, number] => {
  return [node.range[0] + 1, node.range[1] - 1];
}
