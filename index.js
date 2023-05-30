let NIL = void 0,
  REDRAWS = [],
  DOM_KEY = Symbol('umai'),
  RETAIN_KEY = '=',
  STATEFUL = new WeakMap,
  isArray = Array.isArray,
  isStr = x => typeof x === 'string',
  isFn = x => typeof x === 'function',
  isObj = x => x !== null && typeof x === 'object',
  noop = _ => {},
  isRenderable = x => x === null || typeof x === 'string' || typeof x === 'number' || x.type || isArray(x),
  makeEl = v => v.tag ? document.createElement(v.tag) : document.createTextNode(v),
  addChildren = (x, children, i) => {
    if (isArray(x)) for (i = 0; i < x.length; i++) addChildren(x[i], children);
    else if (x !== null && x !== false && x !== NIL) children.push(x)
  };

let renderComponent = vnode => {
  let fn = vnode.tag,
    htmlVnode = fn(vnode.attrs, vnode.children);

  while (htmlVnode.type !== 1) {
    // how do you know when you've run into the same closure comopnent again?
    // and thus, how do you know which renderFn to call (or whether to create a new one)?

    // if (isFn(htmlVnode)) {
    //   let id = 1,
    //    existing = STATEFUL.get(fn) || new Map;

    //   while (existing.has(id)) id++;
    //   existing.set(id, htmlVnode);

    //   // closure component
    //   CLOSURES.set(htmlVnode, fn); // renderFn -> outerFn
    // }

    // if the type is not 1, that means we have nested component vnode
    fn = htmlVnode.tag;
    htmlVnode = htmlVnode.tag(htmlVnode.attrs, htmlVnode.children);
  }

  return htmlVnode;
};

let update = (el, vnode, env, redraw) => {
  // debugger;
  // in the event that `render` is called directly, env.redraw won't exist
  // account for that here
  redraw = env ? env.redraw : noop;

  // if it's a text element, set the data
  if (!vnode.tag)
    return el.nodeValue === vnode + '' || (el.nodeValue = vnode)

  let i;
  // set the attributes
  for (i in vnode.attrs) {
    let attr = vnode.attrs[i];

    if (i in el) {
      // it's an element property
      // if it's an event handler, bind to redraw
      if (i[0] === 'o' && i[1] === 'n' && isFn(attr)) {
        let res, fn = attr;
        el[i] = ev =>
          (res = fn(ev)) instanceof Promise
            ? res.finally(_ => (redraw(), res = NIL))
            : (redraw(), res = NIL);
      } else el[i] = attr; // else assign the property to the element/node
    } else if (!isFn(attr) && el.getAttribute(i) != attr) {
      if (attr === null || attr === NIL || attr === true) attr = '';
      if (attr === false) el.removeAttribute(i);
      else el.setAttribute(i, attr);
    }
  }

  let oldAttrs;
  if (oldAttrs = el[DOM_KEY].oldAttrs) {
    for (i = 0; i < oldAttrs.length; i++) {
      let attrName = oldAttrs[i];
      if (!(attrName in vnode.attrs)) {
        if (attrName in el) el[attrName] = NIL;
        else el.removeAttribute(attrName);
      }
    }
  }

  el[DOM_KEY].oldAttrs = Object.keys(vnode.attrs);
  // console.log(el);
}

export function render(parentEl, vnode, env) {
  let i, tmp,
    olds = parentEl.childNodes || [],
    news = vnode.children || [];

  if (vnode.type === 2) {
    // component vnode
    return render(parentEl, renderComponent(vnode));
  }

  // trim the parent's nodes until you have the length of the vnode's children
  for (i = 0, tmp = Math.max(0, olds.length - news.length); i < tmp; i++) {
    parentEl.removeChild(parentEl.lastChild);
  }

  // process children; create elements, update them, patch them, etc.
  for (i = 0, tmp = news.length; i < tmp; i++) {
    let el, _vnode = news[i];

    // if the child is a component, dive until we receive a type=1 (HTML) vnode
    if (_vnode.type === 2) _vnode = renderComponent(_vnode);

    // get existing node/element (olds[i]) or make new one
    el = olds[i] || makeEl(_vnode);

    // if old one in that index of parent does not exist, append the new element we just created
    if (!olds[i]) parentEl.appendChild(el);

    // if old one does exist, but there is a tag mismatch, we need to create a new element, and replace old one
    if ((el.tagName || '') !== (_vnode.tag || '').toUpperCase()) {
      el = makeEl(_vnode);
      parentEl.replaceChild(el, olds[i]);
    }

    // attach umai "bag"
    el[DOM_KEY] = el[DOM_KEY] || {};

    // at this point, el is either the old Element,
    // or the new one we just created.
    // `vnode` is the vnode that we maybe just created a new element from.
    // now we are going to look at the vnode, and update the element's
    // attributes/classes
    update(el, _vnode, env);

    // now recurse, treating el as the parent
    // we will look through the vnode's children now
    render(el, _vnode, env);
  }
}

export function mount(el, cmp) {
  let env, redraw;
  REDRAWS.push(redraw = _ => requestAnimationFrame(_ => render(el, { children: [m(cmp)] }, env)));
  env = { redraw };
  return redraw() && redraw;
}

export const redraw = _ => {
  for (let i = 0, len = REDRAWS.length; i < len; i++)
    REDRAWS[i]();
};

/** @type {import('./index.d.ts').m} **/
export function m(tag, ...tail) {
  let k, tmp, classes,
    type = isFn(tag) ? 2 : 1,
    attrs = {},
    children = [];

  if (tail.length && !isRenderable(tail[0]))
    [attrs, ...tail] = tail;

  if (isStr(tag)) {
    [tag, ...classes] = tag.split('.');

    classes = classes.join(' ');

    if (isObj(tmp = attrs.class)) {
      for (k in tmp) {
        if (tmp[k]) {
          if (classes) classes += ' ';
          classes += k;
        }
      }
    }

    if (isStr(tmp)) classes += !classes ? tmp : tmp ? ' ' + tmp : '';
    if (classes) attrs.class = classes;
  }

  addChildren(tail, children); // will recurse through tail and push valid childs to `children`
  return { type, tag, attrs: { ...attrs }, children };
}

m.retain = _ => m(RETAIN_KEY);
