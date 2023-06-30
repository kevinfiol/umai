type UmaiNode = string | number | null | undefined;
type ChildNode = UmaiNode | VNode;

interface Props {
  [propName: string]: unknown;
}

interface VNode {
  m?: number;
  tag: string | Component | StatefulComponent;
  props: Attrs;
  children: ChildNode[];
}

type Component = (props: Props, oldProps?: Props) => Vnode;
type StatefulComponent = (props: Props) => Component;

/** Creates a virtual DOM node. Can be used to create HTML Element vnodes or consume components. **/
export function m(tag: string, ...tail: (Props | UmaiNode)[]): VNode;

/** Returns the old virtual DOM node for the current component. **/
export function retain(): VNode;

/** Memoizes the given component. Components will re-render only if their props change between render cycles. **/
export function memo(component: Component | StatefulComponent): Component | StatefulComponent;

/** Removes all redraw handlers from the global redraw pool. **/
export function reset(): void;

/** Rerenders all currently mounted applications. **/
export function redraw(): void;

/** Mounts a Component on a given DOM Node. Returns redraw handler. **/
export function mount(node: Node, root: Component): () => void;