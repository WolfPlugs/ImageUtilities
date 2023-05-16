// Tharkit
interface Tree {
    [key: string]: Tree;
  }
  type TreeFilter = string | ((tree: Tree) => boolean);
  
  export function findInTree(
    tree: Tree,
    searchFilter: TreeFilter,
    args: { walkable?: string[]; ignore?: string[]; maxRecursion: number } = { maxRecursion: 100 },
  ): Tree | null | undefined {
    const { walkable, ignore, maxRecursion } = args;
  
    if (maxRecursion <= 0) return;
  
    if (typeof searchFilter === "string") {
      if (Object.prototype.hasOwnProperty.call(tree, searchFilter)) return tree[searchFilter];
    } else if (searchFilter(tree)) {
      return tree;
    }
  
    if (typeof tree !== "object" || tree == null) return;
  
    let tempReturn;
    if (Array.isArray(tree)) {
      for (const value of tree) {
        tempReturn = findInTree(value, searchFilter, {
          walkable,
          ignore,
          maxRecursion: maxRecursion - 1,
        });
        if (typeof tempReturn != "undefined") return tempReturn;
      }
    } else {
      const toWalk = walkable == null ? Object.keys(tree) : walkable;
      for (const key of toWalk) {
        if (!Object.prototype.hasOwnProperty.call(tree, key) || ignore?.includes(key)) continue;
        tempReturn = findInTree(tree[key], searchFilter, {
          walkable,
          ignore,
          maxRecursion: maxRecursion - 1,
        });
        if (typeof tempReturn != "undefined") return tempReturn;
      }
    }
    return tempReturn;
  }
  
  export function findInReactTree(
    tree: Tree,
    searchFilter: TreeFilter,
    maxRecursion = 100,
  ): Tree | null | undefined {
    return findInTree(tree, searchFilter, {
      walkable: ["props", "children", "child", "sibling"],
      maxRecursion,
    });
  }
