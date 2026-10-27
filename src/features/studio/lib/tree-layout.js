/**
 * Turns a flat list of takes (each with an optional parentId) into rows for the lineage tree.
 * Depth first, children in creation order, so a branch always reads top to bottom.
 */
export function layoutTree(takes) {
  const numbers = new Map(takes.map((take, index) => [take.id, index + 1]));
  const children = new Map();
  const roots = [];

  for (const take of takes) {
    if (take.parentId && numbers.has(take.parentId)) {
      if (!children.has(take.parentId)) children.set(take.parentId, []);
      children.get(take.parentId).push(take);
    } else {
      roots.push(take);
    }
  }

  const rows = [];
  const rowOf = new Map();

  function visit(take, depth) {
    const row = {
      take,
      depth,
      number: numbers.get(take.id),
      parentRow: take.parentId ? (rowOf.get(take.parentId) ?? null) : null,
      childCount: children.get(take.id)?.length ?? 0,
    };
    rowOf.set(take.id, rows.length);
    rows.push(row);
    for (const child of children.get(take.id) ?? []) visit(child, depth + 1);
  }

  roots.forEach((root) => visit(root, 0));
  return { rows, maxDepth: rows.reduce((max, row) => Math.max(max, row.depth), 0) };
}

/** "Take 3" numbering is creation order, independent of where the take sits in the tree. */
export function takeNumber(takes, takeId) {
  return takes.findIndex((take) => take.id === takeId) + 1;
}
