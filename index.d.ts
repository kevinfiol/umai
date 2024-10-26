type TargetedEvent
  <Target extends EventTarget = EventTarget, TypedEvent extends Event = Event>
  = Omit<TypedEvent, 'currentTarget'>
    & { readonly currentTarget: Target; };

type EventHandler <E extends TargetedEvent, Target extends EventTarget>
  = { (event: E & { currentTarget: Target | null; target: Target }): void; }

type AnimationEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, AnimationEvent>, Target>;
type ClipboardEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, ClipboardEvent>, Target>;
type CompositionEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, CompositionEvent>, Target>;
type DragEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, DragEvent>, Target>;
type FocusEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, FocusEvent>, Target>;
type GenericEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target>, Target>;
type KeyboardEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, KeyboardEvent>, Target>;
type MouseEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, MouseEvent>, Target>;
type PointerEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, PointerEvent>, Target>;
type TouchEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, TouchEvent>, Target>;
type TransitionEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, TransitionEvent>, Target>;
type UIEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, UIEvent>, Target>;
type WheelEventHandler
  <Target extends EventTarget> = EventHandler<TargetedEvent<Target, WheelEvent>, Target>;

// Receives an element as Target such as HTMLDivElement
type GenericEventAttrs<Target extends EventTarget> = {
  // Image Events
  onload?: GenericEventHandler<Target>;
  onloadcapture?: GenericEventHandler<Target>;
  onerror?: GenericEventHandler<Target>;
  onerrorcapture?: GenericEventHandler<Target>;

  // Clipboard Events
  oncopy?: ClipboardEventHandler<Target>;
  oncopycapture?: ClipboardEventHandler<Target>;
  oncut?: ClipboardEventHandler<Target>;
  oncutcapture?: ClipboardEventHandler<Target>;
  onpaste?: ClipboardEventHandler<Target>;
  onpastecapture?: ClipboardEventHandler<Target>;

  // Composition Events
  oncompositionend?: CompositionEventHandler<Target>;
  oncompositionendcapture?: CompositionEventHandler<Target>;
  oncompositionstart?: CompositionEventHandler<Target>;
  oncompositionstartcapture?: CompositionEventHandler<Target>;
  oncompositionupdate?: CompositionEventHandler<Target>;
  oncompositionupdatecapture?: CompositionEventHandler<Target>;

  // Details Events
  ontoggle?: GenericEventHandler<Target>;

  // Focus Events
  onfocus?: FocusEventHandler<Target>;
  onfocuscapture?: FocusEventHandler<Target>;
  onblur?: FocusEventHandler<Target>;
  onblurcapture?: FocusEventHandler<Target>;

  // Form Events
  onchange?: GenericEventHandler<Target>;
  onchangecapture?: GenericEventHandler<Target>;
  oninput?: GenericEventHandler<Target>;
  oninputcapture?: GenericEventHandler<Target>;
  onsearch?: GenericEventHandler<Target>;
  onsearchcapture?: GenericEventHandler<Target>;
  onsubmit?: GenericEventHandler<Target>;
  onsubmitcapture?: GenericEventHandler<Target>;
  oninvalid?: GenericEventHandler<Target>;
  oninvalidcapture?: GenericEventHandler<Target>;

  // Keyboard Events
  onkeydown?: KeyboardEventHandler<Target>;
  onkeydowncapture?: KeyboardEventHandler<Target>;
  onkeypress?: KeyboardEventHandler<Target>;
  onkeypresscapture?: KeyboardEventHandler<Target>;
  onkeyup?: KeyboardEventHandler<Target>;
  onkeyupcapture?: KeyboardEventHandler<Target>;

  // Media Events
  onabort?: GenericEventHandler<Target>;
  onabortcapture?: GenericEventHandler<Target>;
  oncanplay?: GenericEventHandler<Target>;
  oncanplaycapture?: GenericEventHandler<Target>;
  oncanplaythrough?: GenericEventHandler<Target>;
  oncanplaythroughcapture?: GenericEventHandler<Target>;
  ondurationchange?: GenericEventHandler<Target>;
  ondurationchangecapture?: GenericEventHandler<Target>;
  onemptied?: GenericEventHandler<Target>;
  onemptiedcapture?: GenericEventHandler<Target>;
  onencrypted?: GenericEventHandler<Target>;
  onencryptedcapture?: GenericEventHandler<Target>;
  onended?: GenericEventHandler<Target>;
  onendedcapture?: GenericEventHandler<Target>;
  onloadeddata?: GenericEventHandler<Target>;
  onloadeddatacapture?: GenericEventHandler<Target>;
  onloadedmetadata?: GenericEventHandler<Target>;
  onloadedmetadatacapture?: GenericEventHandler<Target>;
  onloadstart?: GenericEventHandler<Target>;
  onloadstartcapture?: GenericEventHandler<Target>;
  onpause?: GenericEventHandler<Target>;
  onpausecapture?: GenericEventHandler<Target>;
  onplay?: GenericEventHandler<Target>;
  onplaycapture?: GenericEventHandler<Target>;
  onplaying?: GenericEventHandler<Target>;
  onplayingcapture?: GenericEventHandler<Target>;
  onprogress?: GenericEventHandler<Target>;
  onprogresscapture?: GenericEventHandler<Target>;
  onratechange?: GenericEventHandler<Target>;
  onratechangecapture?: GenericEventHandler<Target>;
  onseeked?: GenericEventHandler<Target>;
  onseekedcapture?: GenericEventHandler<Target>;
  onseeking?: GenericEventHandler<Target>;
  onseekingcapture?: GenericEventHandler<Target>;
  onstalled?: GenericEventHandler<Target>;
  onstalledcapture?: GenericEventHandler<Target>;
  onsuspend?: GenericEventHandler<Target>;
  onsuspendcapture?: GenericEventHandler<Target>;
  ontimeupdate?: GenericEventHandler<Target>;
  ontimeupdatecapture?: GenericEventHandler<Target>;
  onvolumechange?: GenericEventHandler<Target>;
  onvolumechangecapture?: GenericEventHandler<Target>;
  onwaiting?: GenericEventHandler<Target>;
  onwaitingcapture?: GenericEventHandler<Target>;

  // Mouse Events
  onclick?: MouseEventHandler<Target>;
  onclickcapture?: MouseEventHandler<Target>;
  oncontextmenu?: MouseEventHandler<Target>;
  oncontextmenucapture?: MouseEventHandler<Target>;
  ondblclick?: MouseEventHandler<Target>;
  ondblclickcapture?: MouseEventHandler<Target>;
  ondrag?: DragEventHandler<Target>;
  ondragcapture?: DragEventHandler<Target>;
  ondragend?: DragEventHandler<Target>;
  ondragendcapture?: DragEventHandler<Target>;
  ondragenter?: DragEventHandler<Target>;
  ondragentercapture?: DragEventHandler<Target>;
  ondragexit?: DragEventHandler<Target>;
  ondragexitcapture?: DragEventHandler<Target>;
  ondragleave?: DragEventHandler<Target>;
  ondragleavecapture?: DragEventHandler<Target>;
  ondragover?: DragEventHandler<Target>;
  ondragovercapture?: DragEventHandler<Target>;
  ondragstart?: DragEventHandler<Target>;
  ondragstartcapture?: DragEventHandler<Target>;
  ondrop?: DragEventHandler<Target>;
  ondropcapture?: DragEventHandler<Target>;
  onmousedown?: MouseEventHandler<Target>;
  onmousedowncapture?: MouseEventHandler<Target>;
  onmouseenter?: MouseEventHandler<Target>;
  onmouseentercapture?: MouseEventHandler<Target>;
  onmouseleave?: MouseEventHandler<Target>;
  onmouseleavecapture?: MouseEventHandler<Target>;
  onmousemove?: MouseEventHandler<Target>;
  onmousemovecapture?: MouseEventHandler<Target>;
  onmouseout?: MouseEventHandler<Target>;
  onmouseoutcapture?: MouseEventHandler<Target>;
  onmouseover?: MouseEventHandler<Target>;
  onmouseovercapture?: MouseEventHandler<Target>;
  onmouseup?: MouseEventHandler<Target>;
  onmouseupcapture?: MouseEventHandler<Target>;

  // Selection Events
  onselect?: GenericEventHandler<Target>;
  onselectcapture?: GenericEventHandler<Target>;

  // Touch Events
  ontouchcancel?: TouchEventHandler<Target>;
  ontouchcancelcapture?: TouchEventHandler<Target>;
  ontouchend?: TouchEventHandler<Target>;
  ontouchendcapture?: TouchEventHandler<Target>;
  ontouchmove?: TouchEventHandler<Target>;
  ontouchmovecapture?: TouchEventHandler<Target>;
  ontouchstart?: TouchEventHandler<Target>;
  ontouchstartcapture?: TouchEventHandler<Target>;

  // Pointer Events
  onpointerover?: PointerEventHandler<Target>;
  onpointerovercapture?: PointerEventHandler<Target>;
  onpointerenter?: PointerEventHandler<Target>;
  onpointerentercapture?: PointerEventHandler<Target>;
  onpointerdown?: PointerEventHandler<Target>;
  onpointerdowncapture?: PointerEventHandler<Target>;
  onpointermove?: PointerEventHandler<Target>;
  onpointermovecapture?: PointerEventHandler<Target>;
  onpointerup?: PointerEventHandler<Target>;
  onpointerupcapture?: PointerEventHandler<Target>;
  onpointercancel?: PointerEventHandler<Target>;
  onpointercancelcapture?: PointerEventHandler<Target>;
  onpointerout?: PointerEventHandler<Target>;
  onpointeroutcapture?: PointerEventHandler<Target>;
  onpointerleave?: PointerEventHandler<Target>;
  onpointerleavecapture?: PointerEventHandler<Target>;
  ongotpointercapture?: PointerEventHandler<Target>;
  ongotpointercapturecapture?: PointerEventHandler<Target>;
  onlostpointercapture?: PointerEventHandler<Target>;
  onlostpointercapturecapture?: PointerEventHandler<Target>;

  // UI Events
  onscroll?: UIEventHandler<Target>;
  onscrollcapture?: UIEventHandler<Target>;

  // Wheel Events
  onwheel?: WheelEventHandler<Target>;
  onwheelcapture?: WheelEventHandler<Target>;

  // Animation Events
  onanimationstart?: AnimationEventHandler<Target>;
  onanimationstartcapture?: AnimationEventHandler<Target>;
  onanimationend?: AnimationEventHandler<Target>;
  onanimationendcapture?: AnimationEventHandler<Target>;
  onanimationiteration?: AnimationEventHandler<Target>;
  onanimationiterationcapture?: AnimationEventHandler<Target>;

  // Transition Events
  ontransitionend?: TransitionEventHandler<Target>;
  ontransitionendcapture?: TransitionEventHandler<Target>;
};

type HTMLProps<T extends keyof HTMLElementTagNameMap> =
  Omit<Partial<HTMLElementTagNameMap[T]>, keyof GlobalEventHandlers | 'style' | 'dataset' | 'txt'> &
  Partial<GenericEventAttrs<HTMLElementTagNameMap[T]>> &
  {
    [key: string]: unknown;
    style?: Partial<CSSStyleDeclaration> | string;
    dataset?: Record<string, string | number | boolean>;
    txt?: string
  };

interface ComponentProps {
  [key: string]: unknown;
}

type Props<T> = T extends keyof HTMLElementTagNameMap
  ? HTMLProps<T>
  : ComponentProps;

type Tag = Component | StatefulComponent | keyof HTMLElementTagNameMap;

type Primitive = string | number | null | undefined;

type ChildNode = Primitive | VNode<any> | Component;

interface VNode<T extends Tag> {
  type: number;
  tag: T;
  props?: Props<T>;
  children?: ChildNode | ChildNode[];
  key?: unknown;
}

export type Component = (props: Props<Component>, oldProps?: Props<Component>) => VNode<any> | m.JSX.Element;
export type StatefulComponent = (props: Props<Component>) => Component;

declare namespace m {
  namespace JSX {
    type Element = VNode<any> | Component;

    type IntrinsicElements
      = { [El in keyof HTMLElementTagNameMap]: HTMLProps<El> };
  }
}

interface MFunction {
  /** Create HTML element vnodes, or components. Pass props as second argument. Pass all children as varargs. **/
  <T extends Tag>(tag: T, props: Props<T>, ...tail: (m.JSX.Element | VNode<any> | Primitive)[]): VNode<T>;

  /** Creates HTML element vnodes, or components. Pass all children as varargs. **/
  <T extends Tag>(tag: T, ...tail: (m.JSX.Element | VNode<any> | Primitive)[]): VNode<T>;

  /** Returns vnode already existing in virtual DOM. Use for memoization. **/
  retain(): VNode<any>;
}

export const m: MFunction;

/** Memoizes the given component. Components will re-render only if their props change between render cycles. **/
export function memo<T = Component | StatefulComponent>(component: T): T;

/** Removes all redraw handlers from the global redraw pool. **/
export function reset(): void;

/** Rerenders all currently mounted applications. **/
export function redraw(): void;

/** Mounts a Component on a given DOM Node. Returns redraw handler. **/
export function mount(node: Node | null, root: Component | VNode<any>): () => void;
