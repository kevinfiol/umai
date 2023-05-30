type UmaiNode = string | number | null | undefined;

interface Attrs {
  [attrName: string]: unknown;
}

interface VNode {
  m?: number;
  tag: string;
  attrs: Attrs;
  children: UmaiNode[];
}

export function m(tag: string, ...tail: (Attrs | UmaiNode)[]): VNode;