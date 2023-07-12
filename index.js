let NIL = void 0,
  TEXT = 3,
  ELEMENT = 1,
  COMPONENT = 2,
  STATEFUL = 4,
  RETAIN_KEY = '=',
  REDRAWS = [],
  EMPTY_OBJ = {},
  isArray = Array.isArray,
  isStr = x => typeof x === 'string',
  isFn = x => typeof x === 'function',
  isObj = x => x !== null && !isArray(x) && typeof x === 'object';

let getKey = v => v == null ? v : v.key;

let patchProp = (node, name, newProp, redraw) => {
  if (name === 'dom' || name === 'remove') {
    // do nothing
  } else if (name in node) {
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

let normalizeVnode = vnode => 
  vnode !== true && vnode !== false && vnode
    ? vnode
    : { type: TEXT, tag: '' };

let propsChanged = (a, b) => {
  for (let k in a) if (a[k] !== b[k]) return true;
  for (let k in b) if (a[k] !== b[k]) return true;
};

let createInstance = (vnode, oldVNode) => {
  let instance,
    memo = vnode.tag.memo,
    oldProps = oldVNode ? oldVNode.props : NIL,
    newProps = vnode.props;

  if (oldProps && memo && !propsChanged(oldProps, newProps))
    instance = oldVNode.instance;
  else
    instance = vnode.tag({ ...newProps, children: vnode.children }, oldProps || EMPTY_OBJ);

  if (instance.tag === RETAIN_KEY)
    instance = oldVNode.instance;
  else if (isFn(instance)) {
    vnode.type = STATEFUL;
    instance.memo = memo;
    instance = {
      ...vnode,
      type: COMPONENT,
      tag: instance
    };
  }

  instance.key = vnode.key;
  return instance;
};

let createComponent = (vnode, redraw) =>
  createNode((vnode.instance = createInstance(vnode)), redraw);

let createNode = (vnode, redraw) => {
  if (vnode.type === COMPONENT || vnode.type === STATEFUL)
    return (vnode.node = createComponent(vnode, redraw));

  let i,
    props = vnode.props,
    node = vnode.type === TEXT
      ? document.createTextNode(vnode.tag)
      : document.createElement(vnode.tag);

  for (i in props) patchProp(node, i, props[i], redraw);

  if (vnode.type === ELEMENT)
    for (i = 0; i < vnode.children.length; i++)
      node.appendChild(
        createNode(
          (vnode.children[i] = normalizeVnode(vnode.children[i])),
          redraw
        )
      );

  vnode.rm = props
    ? isFn(props.dom) && props.dom(node) || props.remove
    : NIL;

  return (vnode.node = node);
};

// let removeNode = (parentNode, node, rm) => {
//   let done = _ => parentNode.removeChild(node),
//     res = isFn(rm) ? rm(node) : NIL;

//   if (res && isFn(res.then))
//     res.finally(done);
//   else done();

//   // if (!res || (res && !isFn(res.then)))
//   //   done();
// };

// let removeChild = (parentNode, vnode, root = parentNode) => {
//   if (vnode.children !== NIL)
//     for (let i = 0; i < vnode.children.length; i++)
//       removeChild(vnode.node, vnode.children[i], root);
//   if (vnode.instance !== NIL)
//     removeChild(parentNode, vnode.instance, root);
//   else removeNode(parentNode, vnode.node, vnode.rm);
// };

let removeNode = (parentNode, node, rm, chain) => {
  let done = _ => parentNode.removeChild(node),
    res = isFn(rm) ? rm(node) : NIL;

  if (res && isFn(res.then))
    res.finally(done);
  else done();

  // if (!res || (res && !isFn(res.then)))
  //   done();
};

let removeChildren = (parentNode, vnode, chain, root = parentNode) => {
  if (vnode.children !== NIL)
    for (let i = 0; i < vnode.children.length; i++)
      removeChildren(vnode.node, vnode.children[i], chain, root);
  if (vnode.instance !== NIL)
    removeChildren(parentNode, vnode.instance, chain, root);
  // else removeNode(parentNode, vnode.node, vnode.rm, chain);
  else if (isFn(vnode.rm)) {
    let res = vnode.rm(vnode.node);
    if (res && isFn(res.then)) {
      if (parentNode !== root) res.then(_ => parentNode.removeChild(vnode.node));
      chain.push(res);
    }
  }

  return chain;
};

let removeChild = async (parentNode, vnode) => {
  // let last = _ => parentNode.removeChild(vnode.node);
  let removals = removeChildren(parentNode, vnode, []);
  let last = removals.pop();

  if (last) last.finally(_ => parentNode.removeChild(vnode.node))
  else parentNode.removeChild(vnode.node)
};

  // function removeElement(parent, element, node) {
  //   function done() {
  //     parent.removeChild(removeChildren(element, node))
  //   }

  //   var cb = node.attributes && node.attributes.onremove
  //   if (cb) {
  //     cb(element, done)
  //   } else {
  //     done()
  //   }
  // }

let patch = (parent, node, oldVNode, newVNode, redraw) => {
  if (oldVNode != null && oldVNode.tag === newVNode.tag)
    newVNode.rm = oldVNode.rm;

  if (oldVNode === newVNode) {
    // memoized
  } else if (oldVNode != null && oldVNode.type === TEXT && newVNode.type === TEXT) {
    // they are both text nodes
    // update if the newVNode does not equal the old one
    if (oldVNode.tag !== newVNode.tag) node.nodeValue = newVNode.tag;
  } else if (oldVNode == null || oldVNode.tag !== newVNode.tag) {
    // if there is a tag mismatch
    // or the old vnode does not exist
    // there needs to be a node replacement
    node = parent.insertBefore(
      createNode((newVNode = normalizeVnode(newVNode)), redraw),
      node
    );

    // if the oldVnode did exist, make sure to remove its real node from the real DOM
    if (oldVNode != null) removeChild(parent, oldVNode);
  } else if (oldVNode.type === STATEFUL && oldVNode.tag === newVNode.tag) {
    newVNode.type = STATEFUL;
    newVNode.instance = {
      ...oldVNode.instance,
      props: newVNode.props,
      children: newVNode.children
    };
    patch(parent, node, oldVNode.instance, newVNode.instance, redraw);
  } else if (oldVNode.type === COMPONENT && oldVNode.tag === newVNode.tag) {
    newVNode.instance = createInstance(newVNode, oldVNode);
    patch(parent, node, oldVNode.instance, newVNode.instance, redraw);
  } else {
    let tmpVKid,
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

    for (let i in { ...oldProps, ...newProps }) {
      if (
        (i === "value" || i === "selected" || i === "checked"
          ? node[i]
          : oldProps[i]) !== newProps[i]
      ) {
        patchProp(node, i, newProps[i], redraw);
      }
    }

    // patch children from top to bottom
    while (newHead <= newTail && oldHead <= oldTail) {
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
        redraw
      );
    }

    // patch children from bottom to top
    while (newHead <= newTail && oldHead <= oldTail) {
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
        redraw
      );
    }

    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        node.insertBefore(
          createNode(
            (newVKids[newHead] = normalizeVnode(newVKids[newHead++])),
            redraw
          ),
          (oldVKid = oldVKids[oldHead]) && oldVKid.node
        );
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        removeChild(node, oldVKids[oldHead++]);
      }
    } else {
      // grab all the old keys from the old children
      let keyed = {},
        newKeyed = {};

      for (let i = oldHead; i <= oldTail; i++) {
        if ((oldKey = getKey(oldVKids[i])) != null) {
          keyed[oldKey] = oldVKids[i];
        }
      }

      while (newHead <= newTail) {
        oldKey = getKey((oldVKid = oldVKids[oldHead]));

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
            removeChild(node, oldVKid);
          }
          // then increment oldHead and go to next iteration
          oldHead++;
          continue;
        }

        // (remember, this is not a child, oldVNode is the PARENT during this call of patch)
        if (newKey == null) {
          if (oldKey == null) {
            patch(
              node,
              oldVKid && oldVKid.node,
              oldVKid,
              newVKids[newHead],
              redraw
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
              redraw
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
                redraw
              );

              newKeyed[newKey] = true;
            } else {
              patch(
                node,
                oldVKid && oldVKid.node,
                null,
                newVKids[newHead],
                redraw
              );
            }
          }

          newHead++;
        }
      }

      while (oldHead <= oldTail) {
        if (getKey((oldVKid = oldVKids[oldHead++])) == null) {
          removeChild(node, oldVKid);
        }
      }

      for (let i in keyed) {
        if (newKeyed[i] == null) {
          removeChild(node, keyed[i]);
        }
      }
    }
  }

  return (newVNode.node = node);
};

let addChildren = (x, children) => {
  if (isArray(x)) for (let i = 0; i < x.length; i++) addChildren(x[i], children);
  else if (isStr(x) || typeof x === 'number') children.push({ type: TEXT, tag: x });
  else children.push(x);
};

export function mount(node, root) {
  node.innerHTML = '<a></a>';
  node = node.lastChild;

  let dom = { type: ELEMENT, node },
    redraw = _ => requestAnimationFrame(
      _ => (node = patch(
        node.parentNode, // parentNode
        node, // node
        dom, // oldVnode
        (dom = root()), // newVnode
        redraw // redraw
      ))
    );

  REDRAWS.push(redraw);
  return redraw() && redraw;
}

/** @type {import('./index.d.ts').redraw} **/
export const redraw = _ =>
  REDRAWS.map(r => r());

/** @type {import('./index.d.ts').reset} **/
export const reset = _ => REDRAWS = [];

/** @type {import('./index.d.ts').memo} **/
export const memo = cmp => (cmp.memo = 1) && cmp;

/** @type {import('./index.d.ts').m} **/
export function m(tag, ...tail) {
  let key, i, tmp, classes,
    props = {},
    children = [],
    first = tail[0],
    type = isFn(tag)
      ? COMPONENT
      : ELEMENT;

  // compensate for when jsx passes null for the first tail item
  if (first == null) tail.shift();

  // check if first child is props object
  if (tail.length > 0 && isObj(first) && !isArray(first.children))
    [{ key, ...props }, ...tail] = tail;

  if (isStr(tag)) {
    if (props.className)
      props.class = props.className;

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

  return tag === '[' // jsx fragment
    ? children
    : { type, tag, key, props, children };
}

/** @type {import('./index.d.ts').retain} **/
m.retain = _ => m(RETAIN_KEY);
