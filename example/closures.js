let NIL = void 0,
  noop = _ => {},
  propDirective = prop => ({
    mount(el, value = '') {
      el[prop] = value;
    },
    patch(el, newValue = '', oldValue) {
      if (newValue !== oldValue) el[prop] = newValue;
    },
    unmount(el) {
      el[prop] = NIL;
    }
  }),
  DEFAULT_ENV = {
    isSVG: false,
    redraw: noop,
    directives: {
      selected: propDirective('selected'),
      checked: propDirective('checked'),
      value: propDirective('value'),
      innerHTML: propDirective('innerHTML')
    }
  },
  RERENDERS = [],
  ON_REMOVES = [],
  CLOSURE_TO_FN = new WeakMap(),
  ON_CREATE_KEY = 'oncreate',
  NUM = 1,
  PARENT_DOM_KEY = '$_REF',
  EMPTY_OBJECT = {},
  SVG_NS = 'http://www.w3.org/2000/svg',
  XLINK_NS = 'http://www.w3.org/1999/xlink',
  NS_ATTRS = { show: XLINK_NS, actuate: XLINK_NS, href: XLINK_NS },
  REF_SINGLE = 1, // ref with single dom node
  VTYPE_ELEMENT = 1,
  VTYPE_FUNCTION = 2,
  REF_ARRAY = 4, // ref with array of nodes
  REF_PARENT = 8, // ref with a child ref
  RETAIN_KEY = '=',
  exists = x => x !== null && x !== undefined,
  hasKey = vnode => vnode && exists(vnode.key),
  haveMatchingKeys = (x, y) => (!exists(x) ? NIL : x.key) === (!exists(y) ? NIL : y.key),
  generateClosureId = _ => NUM++,
  isFn = x => typeof x === 'function',
  isStr = x => typeof x === 'string',
  isObj = x => x !== null && typeof x === 'object',
  isArr = x => Array.isArray(x),
  toJson = v => JSON.stringify(v),
  isEmpty = c => !exists(c) || c === false || (isArr(c) && c.length === 0) || (c && c._t === RETAIN_KEY),
  isNonEmptyArray = c => isArr(c) && c.length > 0,
  isLeaf = c => isStr(c) || typeof c === 'number',
  isElement = c => c && c.vtype === VTYPE_ELEMENT,
  isRenderFunction = c => c && c.vtype === VTYPE_FUNCTION;

let getDomNode = (ref) => {
  let type = ref.type;
  if (type === REF_SINGLE) return ref.node;
  if (type === REF_PARENT) return getDomNode(ref.childRef);
  if (type === REF_ARRAY) return getDomNode(ref.children[0]);
  throw Error('Unknown ref type ' + toJson(ref));
};

let getNextSibling = ref => {
  let type = ref.type;
  if (type === REF_SINGLE) return ref.node.nextSibling;
  if (type === REF_PARENT) return getNextSibling(ref.childRef);
  if (type === REF_ARRAY) return getNextSibling(ref.children[ref.children.length - 1]);
  throw Error('Unknown ref type ' + toJson(ref));
};

let insertDom = (parent, ref, nextSibling) => {
  let type = ref.type;
  if (type === REF_SINGLE) parent.insertBefore(ref.node, nextSibling);
  else if (type === REF_PARENT) insertDom(parent, ref.childRef, nextSibling);
  else if (type === REF_ARRAY)
    for (let i = 0; i < ref.children.length; i++)
      insertDom(parent, ref.children[i], nextSibling);
  else throw Error('Unknown ref type ' + toJson(ref));
};

let removeDom = (parent, ref) => {
  let type = ref.type;
  if (type === REF_SINGLE) parent.removeChild(ref.node);
  else if (type === REF_PARENT) removeDom(parent, ref.childRef);
  else if (type === REF_ARRAY)
    for (let i = 0; i < ref.children.length; i++)
      removeDom(parent, ref.children[i]);
  else throw Error('Unknown ref type ' + toJson(ref));
};

let replaceDom = (parent, newRef, oldRef) => {
  insertDom(parent, newRef, getDomNode(oldRef));
  removeDom(parent, oldRef);
};

let setDomAttribute = (el, attr, value, isSVG) => {
  if (!exists(value)) value = '';
  if (value === true) el.setAttribute(attr, '');
  else if (value === false) el.removeAttribute(attr);
  else (isSVG && NS_ATTRS[attr])
    ? el.setAttributeNS(NS_ATTRS[attr], attr, value)
    : el.setAttribute(attr, value);
};

let mountAttributes = (el, props, env) => {
  for (let key in props) {
    if (key === 'key' || key === 'children' || key === ON_CREATE_KEY || key in env.directives) continue;
    else if (key.startsWith('on'))
      el[key.toLowerCase()] = ev => { props[key](ev); !env.manualRedraw && env.rerender(); };
    else setDomAttribute(el, key, props[key], env.isSVG);
  }
};

let patchAttributes = (el, newProps, oldProps, env) => {
  let key;
  for (key in newProps) {
    if (key === 'key' || key === 'children' || key === ON_CREATE_KEY || key in env.directives)
      continue;

    let oldValue = oldProps[key],
      newValue = newProps[key];

    if (oldValue !== newValue)
      key.startsWith('on')
        ? el[key.toLowerCase()] = ev => { newValue(ev); !env.manualRedraw && env.rerender(); }
        : setDomAttribute(el, key, newValue, env.isSVG);
  }

  for (key in oldProps) {
    if (key === 'key' || key === 'children' || key in newProps || key in env.directives)
      continue;

    if (key.startsWith('on')) el[key.toLowerCase()] = NIL;
    else el.removeAttribute(key);
  }
};

let mountDirectives = (el, props, env) => {
  for (let key in props)
    if (key in env.directives)
      env.directives[key].mount(el, props[key]);
};

let patchDirectives = (el, newProps, oldProps, env) => {
  let key;
  for (key in newProps)
    if (key in env.directives)
      env.directives[key].patch(el, newProps[key], oldProps[key]);
  
  for (key in oldProps)
    if (key in env.directives && !(key in newProps))
      env.directives[key].unmount(el, oldProps[key]);
};

let unmountDirectives = (el, props, env) => {
  for (let key in props)
    if (key in env.directives)
      env.directives[key].unmount(el, props[key]);
};

let mount = (vnode, env, closureId, closure, onRemove = noop) => {
  let baseRef = { closureId, closure, onRemove };

  if (isEmpty(vnode))
    return { ...baseRef, type: REF_SINGLE, node: document.createTextNode('') };

  if (isLeaf(vnode))
    return { ...baseRef, type: REF_SINGLE, node: document.createTextNode(vnode) };

  if (isElement(vnode)) {
    let node,
      { _t, props } = vnode;

    if (_t === 'svg' && !env.isSVG)
      env = { ...env, isSVG: true };

    if (!env.isSVG) node = document.createElement(_t);
    else node = document.createElementNS(SVG_NS, _t);

    isFn(props[ON_CREATE_KEY]) && props[ON_CREATE_KEY](node);

    mountAttributes(node, props, env);

    let children = props.children === NIL
      ? props.children
      : mount(props.children, env);

    if (children !== NIL) insertDom(node, children);
    mountDirectives(node, props, env);

    return {
      ...baseRef,
      type: REF_SINGLE,
      node,
      children
    }
  }

  if (isNonEmptyArray(vnode)) {
    let i = 0, children = [];
    for (; i < vnode.length; i++)
      children.push(mount(vnode[i], env));

    return {
      ...baseRef,
      type: REF_ARRAY,
      children
    };
  }

  if (isRenderFunction(vnode)) {
    let childVnode = vnode._t(vnode.props); // if this is a closure component, this will be "oninit"

    if (isFn(childVnode)) {
      // closure component
      let id = generateClosureId(),
        fnMap = CLOSURE_TO_FN.get(vnode._t) || new Map(),
        onRemove = ON_REMOVES.pop() || noop;

      fnMap.set(id, childVnode); // save renderFn
      CLOSURE_TO_FN.set(vnode._t, fnMap); // closure -> Map(id -> renderFn)

      let closure = vnode._t;
      vnode._t = childVnode;
      return mount(vnode, env, id, closure, onRemove);
    }

    return {
      ...baseRef,
      type: REF_PARENT,
      childRef: mount(childVnode, env),
      childState: childVnode
    };
  }

  if (vnode instanceof Node)
    return { ...baseRef, type: REF_SINGLE, node: vnode };
  
  if (vnode === NIL)
    throw Error('mount: vnode is undefined');

  throw Error('mount: Invalid vnode');
};

let unmount = (vnode, ref, env) => {
  if (isElement(vnode)) {
    unmountDirectives(ref.node, vnode.props, env);
    if (vnode.props.children !== NIL)
      unmount(vnode.props.children, ref.children, env);
  } else if (isNonEmptyArray(vnode)) {
    for (let i = 0; i < vnode.length; i++)
      unmount(vnode[i], ref.children[i], env);
  } else if (isRenderFunction(vnode)) {
    let closure = ref.closure,
      closureId = ref.closureId,
      onRemove = ref.onRemove,
      fns = CLOSURE_TO_FN.get(closure);

    if (fns && closureId && fns.get(closureId)) {
      fns.delete(closureId);
      !fns.size && CLOSURE_TO_FN.delete(closure);
      onRemove();
    }

    unmount(ref.childState, ref.childRef, env);
  }
};

let patchInPlace = (parentDomNode, newVnode, oldVnode, ref, env) => {
  let newRef = patch(parentDomNode, newVnode, oldVnode, ref, env);

  if (newRef !== ref) {
    replaceDom(parentDomNode, newRef, ref);
    unmount(oldVnode, ref, env);
  }
  
  return newRef;
};

let patchChildren = (parentDomNode, newChildren, oldChildren, ref, env) => {
  // we need to retrieve the next sibling before the old children get eventually removed from the current DOM document
  let oldVnode,
    newVnode,
    oldRef,
    newRef,
    refMap,
    nextNode = getNextSibling(ref),
    children = Array(newChildren.length),
    refChildren = ref.children,
    newStart = 0,
    oldStart = 0,
    newEnd = newChildren.length - 1,
    oldEnd = oldChildren.length - 1;

  while (newStart <= newEnd && oldStart <= oldEnd) {
    if (refChildren[oldStart] === NIL) {
      oldStart++;
      continue;
    }

    if (refChildren[oldEnd] === NIL) {
      oldEnd--;
      continue;
    }

    oldVnode = oldChildren[oldStart];
    newVnode = newChildren[newStart];

    if (haveMatchingKeys(newVnode, oldVnode)) {
      oldRef = refChildren[oldStart];
      newRef = children[newStart] = patchInPlace(
        parentDomNode,
        newVnode,
        oldVnode,
        oldRef,
        env
      );
      newStart++;
      oldStart++;
      continue;
    }

    oldVnode = oldChildren[oldEnd];
    newVnode = newChildren[newEnd];

    if (haveMatchingKeys(newVnode, oldVnode)) {
      oldRef = refChildren[oldEnd];
      newRef = children[newEnd] = patchInPlace(
        parentDomNode,
        newVnode,
        oldVnode,
        oldRef,
        env
      );
      newEnd--;
      oldEnd--;
      continue;
    }

    if (!refMap) {
      refMap = {};
      for (let i = oldStart; i <= oldEnd; i++) {
        oldVnode = oldChildren[i];
        if (hasKey(oldVnode)) {
          refMap[oldVnode.key] = i;
        }
      }
    }

    newVnode = newChildren[newStart];

    let idx = hasKey(newVnode) ? refMap[newVnode.key] : NIL;
    if (idx !== NIL) {
      oldVnode = oldChildren[idx];
      oldRef = refChildren[idx];
      newRef = children[newStart] = patch(
        parentDomNode,
        newVnode,
        oldVnode,
        oldRef,
        env
      );

      insertDom(parentDomNode, newRef, getDomNode(refChildren[oldStart]));

      if (newRef !== oldRef) {
        removeDom(parentDomNode, oldRef);
        unmount(oldVnode, oldRef, env);
      }

      refChildren[idx] = NIL;
    } else {
      newRef = children[newStart] = mount(newVnode, env);
      insertDom(parentDomNode, newRef, getDomNode(refChildren[oldStart]));
    }

    newStart++;
  }

  let beforeNode =
    newEnd < newChildren.length - 1
      ? getDomNode(children[newEnd + 1])
      : nextNode;

  while (newStart <= newEnd) {
    let newRef = mount(newChildren[newStart], env);
    children[newStart] = newRef;
    insertDom(parentDomNode, newRef, beforeNode);
    newStart++;
  }

  while (oldStart <= oldEnd) {
    oldRef = refChildren[oldStart];

    if (oldRef !== NIL) {
      removeDom(parentDomNode, oldRef);
      unmount(oldChildren[oldStart], oldRef, env);
    }

    oldStart++;
  }

  ref.children = children;
};

let patch = (parentDomNode, newVnode, oldVnode, ref, env = { ...DEFAULT_ENV }) => {
  if (newVnode && newVnode._t === RETAIN_KEY) return ref;

  let closure, closureId;

  if (isObj(ref)) {
    closure = ref.closure;
    closureId = ref.closureId;
  }

  if (isRenderFunction(newVnode) && isRenderFunction(oldVnode) && (newVnode._t === oldVnode._t || (closure && closureId))) {
    // x is either a renderFn or a closure
    let x = newVnode._t,
      fn,
      fns = CLOSURE_TO_FN.get(closure);

    if (fns && closureId && (fn = fns.get(closureId)))
      x = fn;

    let childVnode = x(newVnode.props),
      childRef = patch(
        parentDomNode,
        childVnode,
        ref.childState,
        ref.childRef,
        env
      );

    // we need to return a new ref in order for parent patches to properly replace changing DOM nodes
    if (childRef !== ref.childRef)
      return {
        type: REF_PARENT,
        childRef,
        childState: childVnode
      };
    else {
      ref.childState = childVnode;
      return ref;
    }
  }

  if (oldVnode === newVnode || (isEmpty(newVnode) && isEmpty(oldVnode)))
    return ref;

  if (isLeaf(newVnode) && isLeaf(oldVnode)) {
    // leafs just need to have node value updated
    ref.node.nodeValue = newVnode;
    return ref;
  }

  if (isElement(newVnode) && isElement(oldVnode) && newVnode._t === oldVnode._t) {
    // make sure env has isSVG flag set to true
    if (newVnode._t === 'svg' && !env.isSVG)
      env = { ...env, isSVG: true };

    // update the node DOM attributes with the new props
    patchAttributes(ref.node, newVnode.props, oldVnode.props, env);

    let oldChildren = oldVnode.props.children,
      newChildren = newVnode.props.children;

    if (oldChildren === NIL) {
      if (newChildren !== NIL) {
        ref.children = mount(newChildren, env);
        insertDom(ref.node, ref.children);
      }
    } else {
      if (newChildren === NIL) {
        ref.node.textContent = '';
        unmount(oldChildren, ref.children, env);
        ref.children = NIL;
      } else {
        ref.children = patchInPlace(
          ref.node,
          newChildren,
          oldChildren,
          ref.children,
          env
        );
      }
    }

    patchDirectives(ref.node, newVnode.props, oldVnode.props, env);
    return ref;
  }
  
  if (isNonEmptyArray(newVnode) && isNonEmptyArray(oldVnode)) {
    patchChildren(parentDomNode, newVnode, oldVnode, ref, env);
    return ref;
  }

  if (newVnode instanceof Node && oldVnode instanceof Node) {
    ref.node = newVnode;
    return ref;
  }

  return mount(newVnode, env);
};

export function h(_t, ...children) {
  let idx, props = children[0];
  if (props && isObj(props) && !isArr(props) && !(props._t || props.props))
    children.shift();
  else props = EMPTY_OBJECT;

  props =
    children.length > 1
      ? { ...props, children }
      : children.length === 1
      ? { ...props, children: children[0] }
      : props;

  if (isStr(_t)) {
    if (props.className && !props.class) {
      props.class = props.className;
      delete props.className;
    }

    // class parsing
    if (isObj(props.class)) {
      let k, tmp = '';

      for (k in props.class)
        if (props.class[k]) {
          tmp && (tmp += ' ');
          tmp += k
        }

      props.class = tmp;
    }

    if (~(idx = _t.indexOf('.'))) {
      let className = _t.slice(idx + 1).replace(/\./g, ' ') + (props.class ? ' ' + props.class : '');
      if (className) props.class = className;
      _t = _t.slice(0, idx);
    }
  }

  if (props.key !== props.key) throw new Error("Invalid NaN key");

  let vtype =
    isStr(_t)
      ? VTYPE_ELEMENT
      : isFn(_t)
      ? VTYPE_FUNCTION
      : NIL;

  if (vtype === NIL) throw new Error("Invalid VNode type");

  // returns a vnode
  return {
    vtype, // (number) VTYPE_ELEMENT | VTYPE_FUNCTION
    _t, // (string | object | function)
    key: props.key, // string
    props // object
  };
}

h.retain = _ => h(RETAIN_KEY);

export const m = h;

export const Fragment = props => props.children;

export const onRemove = fn => ON_REMOVES.push(fn);

export function app(vnode, parentDomNode, opts = {}) {
  let ref,
    env = { ...DEFAULT_ENV, manualRedraw: opts.manualRedraw },
    rootRef = parentDomNode[PARENT_DOM_KEY];

  env.directives = { ...env.directives, ...(opts.directives || {}) };

  if (rootRef !== NIL)
    throw Error('App already mounted on this node');

  ref = mount(vnode, env);
  rootRef = parentDomNode[PARENT_DOM_KEY] = { ref, vnode };
  parentDomNode.textContent = '';
  insertDom(parentDomNode, ref, NIL);

  // not passing a new vnode will rerender the app in place
  return RERENDERS.push(
    env.rerender = (newVnode = vnode) => {
      rootRef.ref = patchInPlace(
        parentDomNode,
        newVnode,
        rootRef.vnode,
        rootRef.ref,
        env
      );

      rootRef.vnode = newVnode;
    }
  ) && env.rerender;
}

export function umount(el, vnode) {
  return app(h(vnode), el);
}

// "global" redraw
// will rerender all mounted apps
export const redraw = _ => {
  for (let i = 0; i < RERENDERS.length; i++)
    RERENDERS[i]();
}