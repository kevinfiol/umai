let NIL = void 0,
  COMPONENT = 2,
  ELEMENT = 1,
  TEXT = 3,
  REDRAWS = [],
  RETAIN_KEY = '=',
  STATEFUL = new WeakMap,
  isArray = Array.isArray,
  isStr = x => typeof x === 'string',
  isFn = x => typeof x === 'function',
  isObj = x => x !== null && typeof x === 'object',
  isRenderable = x => x === null || typeof x === 'string' || typeof x === 'number' || x.type || isArray(x),
  getKey = v => v == null ? v : v.key,
  addChildren = (x, children) => {
    if (isArray(x)) for (let i = 0; i < x.length; i++) addChildren(x[i], children);
    else if (isStr(x) || typeof x === 'number') children.push({ type: TEXT, tag: x });
    else children.push(x);
  },
  map = REDRAWS.map;

let patchProp = (node, name, newProp, { redraw }) => {
  if (name in node) {
    if (name[0] === 'o' && name[1] === 'n') {
      let res, fn = newProp;

      node[name] = ev =>
        (res = fn(ev)) instanceof Promise
          ? res.finally(_ => (redraw(), res = NIL))
          : (redraw(), res = NIL);
    } else if (name !== 'list' && name !== 'form') node[name] = newProp;
  } else if (!isFn(newProp) && node.getAttribute(name) != newProp) {
    if (newProp == null || newProp === false) node.removeAttribute(name);
    else node.setAttribute(name, newProp);
  }
};

let normalizeVnode = (vnode, oldVNode) => {
  if (vnode !== true && vnode !== false && vnode) {
    // stateful component logic goes here OR NOT
    if (oldVNode && oldVNode.id !== NIL && isFn(vnode.tag) && oldVNode.fn === vnode.fn) {
      // get the render fn
      let existing = STATEFUL.get(vnode.fn);
      let renderFn = existing.get(oldVNode.id);
      // overwrite newVnode
      return {
        ...oldVNode,
        ...vnode,
        ...renderFn(vnode.props, vnode.children)
      };
    } else if (vnode.fn !== NIL && isFn(vnode.tag)) {
      // vnode.tag is the renderFn
      let _vnode, id, existing = STATEFUL.get(vnode.fn) || new Map;
      id = 1;

      while (existing.has(id)) id++;
      existing.set(id, vnode.tag);
      if (!STATEFUL.has(vnode.fn)) STATEFUL.set(vnode.fn, existing);

      _vnode = { id, ...vnode, ...vnode.tag(vnode.props, vnode.children), key: vnode.key };
      return _vnode;
    }

    return vnode;
  }

  return { type: TEXT, tag: '' };
}

let unpackComponent = (vnode) => {
  debugger;
  let last, fn, id, key, props, children;

  while (!vnode.type || vnode.type === COMPONENT) {
    if (isFn(vnode))
      return { ...last, fn, tag: vnode };

    last = vnode;
    fn = vnode.tag;
    key = vnode.key || key;
    id = vnode.id || id;
    props = vnode.props;
    children = vnode.children;
    vnode = fn(props, children);
  }

  vnode.key = key;
  return vnode;
};

let createNode = (vnode, env) => {
  let i,
    props = vnode.props,
    node = vnode.type === TEXT
      ? document.createTextNode(vnode.tag)
      : document.createElement(vnode.tag);

  for (i in props) patchProp(node, i, props[i], env);

  if (vnode.type !== TEXT)
    for (i = 0; i < vnode.children.length; i++)
      node.appendChild(
        createNode(
          (vnode.children[i] = normalizeVnode(vnode.children[i])),
          env
        )
      );

  return (vnode.node = node);
};

let patch = (parent, node, oldVNode, newVNode, env) => {
  debugger;
  if (oldVNode === newVNode) {
  } else if (oldVNode != null && oldVNode.type === TEXT && newVNode.type === TEXT) {
    // they are both text nodes
    // update if the newVNode does not equal the old one
    if (oldVNode.tag !== newVNode.tag) node.nodeValue = newVNode.tag;
  } else if (oldVNode == null || oldVNode.tag !== newVNode.tag) {
    // if there is a tag mismatch
    // or the old vnode does not exist
    // there needs to be a node replacement
    node = parent.insertBefore(
      createNode((newVNode = normalizeVnode(newVNode, oldVNode)), env),
      node
    )

    // if the oldVnode did exist, make sure to remove its real node from the real DOM
    if (oldVNode != null) {
      parent.removeChild(oldVNode.node);

      // if it's a stateful component, clean up
      if (oldVNode.fn !== NIL) {
        let existing = STATEFUL.get(oldVNode.fn);
        existing.delete(oldVNode.id);
        if (existing.size === 0) STATEFUL.delete(oldVNode.fn);
      }
    }
  } else {
    let i,
      tmpVKid,
      oldVKid,
      oldKey,
      newKey,
      oldProps = oldVNode.props,
      newProps = newVNode.props,
      oldVKids = oldVNode.children,
      newVKids = newVNode.children,
      oldHead = 0,
      newHead = 0,
      oldTail = oldVKids.length - 1,
      newTail = newVKids.length - 1;

    // 1. patch the properties first
    for (i in { ...oldProps, ...newProps }) {
      // if the property is value, selected, or checked, compare the property on the actual dom NODE to newProps
      // otherwise, compare oldProps[i] to newProps[i]
      if (
        (i === "value" || i === "selected" || i === "checked"
          ? node[i]
          : oldProps[i]) !== newProps[i]
      ) {
        patchProp(node, i, newProps[i], env);
      }
    }

    // 2. patch children from top to bottom
    // loop while we are in the bounds of the new children AND the old children
    while (newHead <= newTail && oldHead <= oldTail) {
      // if either the old first child isn't keyed
      // or if the old first child's key doesn't match the new first child key,
      // BREAK
      // so this means if you have a list of unkeyed OLD children, we will not execute this while block at all
      if (
        (oldKey = getKey(oldVKids[oldHead])) == null ||
        oldKey !== getKey(newVKids[newHead])
      ) {
        break;
      }

      patch(
        node,
        oldVKids[oldHead].node,
        oldVKids[oldHead],
        (newVKids[newHead] = normalizeVnode(
          newVKids[newHead++],
          oldVKids[oldHead++]
        )),
        env
      );
    }

    // 3. patch children from bottom to top
    // loop while we are in the bounds of the new children AND the old children
    while (newHead <= newTail && oldHead <= oldTail) {
      // if either the old LAST child isn't keyed
      // or if the old LAST child's key doesn't match the new LAST child key,
      // BREAK
      // so this means if you have a list of unkeyed OLD children, we will not execute this while block at all
      if (
        (oldKey = getKey(oldVKids[oldTail])) == null ||
        oldKey !== getKey(newVKids[newTail])
      ) {
        break;
      }

      patch(
        node,
        oldVKids[oldTail].node,
        oldVKids[oldTail],
        (newVKids[newTail] = normalizeVnode(
          newVKids[newTail--],
          oldVKids[oldTail--]
        )),
        env
      );
    }

    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        node.insertBefore(
          createNode(
            (newVKids[newHead] = normalizeVnode(newVKids[newHead++], oldVKids[oldHead])),
            env
          ),
          (oldVKid = oldVKids[oldHead]) && oldVKid.node
        );
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        node.removeChild(oldVKids[oldHead++].node);
      }
    } else {
      // grab all the old keys from the old children
      let keyed = {},
        newKeyed = {},
        i = oldHead;

      for (; i <= oldTail; i++) {
        if ((oldKey = oldVKids[i].key) != null) {
          keyed[oldKey] = oldVKids[i];
        }
      }

      while (newHead <= newTail) {
        // get the key for the current old child
        // while you're at it, assign oldVKid (which is undefined on the first iteration of this loop)
        // to the current child at the index oldHead (which we will increment)
        oldKey = getKey((oldVKid = oldVKids[oldHead]));

        // get the key for the current new child
        // while we're at it, assign the current index at newVKids
        // use maybeVnode to normalize the vnode at newVKids[newHead].
        // oldVKid is passed in solely for memoization purposes, so can ignore that for now
        newKey = getKey(
          (newVKids[newHead] = normalizeVnode(newVKids[newHead], oldVKid))
        );

        // if we have this oldKey in newKeyed
        // or if newKey is defined and is equal to the *next* old child's key
        if (
          newKeyed[oldKey] ||
          (newKey != null && newKey === getKey(oldVKids[oldHead + 1]))
        ) {
          // then you can remove the old child at the current oldHead index
          // assuming it's key is null or undefined
          if (oldKey == null) {
            node.removeChild(oldVKid.node);
          }
          // then increment oldHead and go to next iteration
          oldHead++;
          continue;
        }

        // otherwise, if the new child is keyless, and the oldVNode is an element vnode
        // (remember, this is not a child, oldVNode is the PARENT during this call of patch)
        if (newKey == null || oldVNode.type === ELEMENT) {
          if (oldKey == null) {
            patch(
              node,
              oldVKid && oldVKid.node,
              oldVKid,
              newVKids[newHead],
              env
            );

            newHead++;
          }

          oldHead++;
        } else {
          if (oldKey === newKey) {
            patch(
              node,
              oldVKid.node,
              oldVKid,
              newVKids[newHead],
              env
            )
            newKeyed[newKey] = true;
            oldHead++;
          } else {
            if ((tmpVKid = keyed[newKey]) != null) {
              patch(
                node,
                node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),
                tmpVKid,
                newVKids[newHead],
                env
              );

              newKeyed[newKey] = true;
            } else {
              patch(
                node,
                oldVKid && oldVKid.node,
                null,
                newVKids[newHead],
                env
              );
            }
          }

          newHead++;
        }
      }

      // debugger;
      while (oldHead <= oldTail) {
        if (getKey((oldVKid = oldVKids[oldHead++])) == null) {
          node.removeChild(oldVKid.node);
        }
      }

      for (let i in keyed) {
        if (newKeyed[i] == null) {
          node.removeChild(keyed[i].node);
        }
      }
    }
  }

  console.log({ oldVNode, newVNode });
  return (newVNode.node = node);
}

export function mount(node, view) {
  // debugger;
  node.innerHTML = '<a></a>';
  node = node.lastChild;

  let env = {},
    dom = { type: ELEMENT, node },
    draw = _ =>
      (node = patch(
        node.parentNode, // parentNode
        node, // node
        dom, // oldVnode
        (dom = view()), // newVnode
        env // env
      ));

  REDRAWS.push(env.redraw = _ => requestAnimationFrame(draw));
  return env.redraw() && env.redraw;
}

export const redraw = _ => {
  for (let i = 0, len = REDRAWS.length; i < len; i++)
    REDRAWS[i]();
};

/** @type {import('./index.d.ts').m} **/
export function m(tag, ...tail) {
  // debugger;
  let vnode, key, i, tmp, classes,
    type = isFn(tag) ? COMPONENT : ELEMENT,
    props = {},
    children = [];

  if (tail.length && !isRenderable(tail[0]))
    [{ key, ...props }, ...tail] = tail;

  if (isStr(tag)) {
    [tag, ...classes] = tag.split('.');

    classes = classes.join(' ');

    if (isObj(tmp = props.class)) {
      for (i in tmp) {
        if (tmp[i]) {
          if (classes) classes += ' ';
          classes += i;
        }
      }
    }

    if (isStr(tmp)) classes += !classes ? tmp : tmp ? ' ' + tmp : '';
    if (classes) props.class = classes;
  }

  addChildren(tail, children); // will recurse through tail and push valid childs to `children`
  vnode = { type, tag, key, props: { ...props }, children };
  return type === COMPONENT ? unpackComponent(vnode) : vnode;
}

m.retain = _ => m(RETAIN_KEY);
