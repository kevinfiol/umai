let NIL = void 0,
  REDRAWS = [],
  CMP_KEY = '__m',
  RETAIN_KEY = '=',
  isArray = Array.isArray,
  isStr = x => typeof x === 'string',
  isFn = x => typeof x === 'function',
  isObj = x => x !== null && typeof x === 'object',
  noop = _ => {},
  isRenderable = x => x === null || typeof x === 'string' || typeof x === 'number' || x[CMP_KEY] || isArray(x),
  makeEl = v => v[CMP_KEY] ? document.createElement(v.tag) : document.createTextNode(v),
  addChildren = (x, children, i) => {
    if (isArray(x)) for (i = 0; i < x.length; i++) addChildren(x[i], children);
    else if (x !== null && x !== false && x !== NIL) children.push(x)
  };

let update = (el, v, env, redraw) => {
  // in the event that `render` is called directly, env.redraw won't exist
  // account for that here
  redraw = env ? env.redraw : noop;

  // if it's a text element, set the data
  if (!v[CMP_KEY])
    return el.data === v + '' || (el.data = v);

  let i, tmp;
  // set the attributes
  for (i in v.attrs) {
    if (i.startsWith('on') && isFn(v.attrs[i]) && el[i] !== v.attrs[i]) {
      let res, fn = v.attrs[i];
      el[i] = ev =>
        (res = fn(ev)) instanceof Promise
          ? res.finally(_ => (redraw(), res = NIL))
          : (redraw(), res = NIL);
    } else if (el.getAttribute(i) != (tmp = v.attrs[i])) {
      if (tmp === null || tmp === NIL || tmp === true) tmp = '';
      if (tmp === false) el.removeAttribute(i);
      else el.setAttribute(i, tmp);
    }
  }

  // remove attributes
  for (i = 0, tmp = [...el.getAttributeNames(), ...Object.keys(el)]; i < tmp.length; i++)
    if (!(tmp[i] in v.attrs)) {
      if (tmp[i].startsWith('on') && isFn(el[tmp[i]]))
        el[tmp[i]] = NIL;
      else el.removeAttribute(tmp[i]);
    }
}

export function render(parent, cmp, env) {
  let i, tmp,
    olds = parent.childNodes || [],
    children = cmp.children || [],
    news = isArray(children) ? children : [children];

  // remove excess old nodes
  for (i = 0, tmp = Array(Math.max(0, olds.length - news.length)); i < tmp.length; i++)
    parent.removeChild(parent.lastChild);

  for (i = 0; i < news.length; i++) {
    let el, vnode = news[i];
    if (vnode.tag === RETAIN_KEY) continue;

    // get existing node/element (olds[i]) or make new one
    el = olds[i] || makeEl(vnode);

    // if old one in that index of parent does not exist, append the new element we just created
    if (!olds[i]) parent.appendChild(el);

    // if old one does exist, but there is a tag mismatch, we need to create a new element, and replace old one
    if ((el.tagName || '') !== (vnode.tag || '').toUpperCase()) {
      el = makeEl(vnode);
      parent.replaceChild(el, olds[i]);
    }

    // at this point, el is either the old Element,
    // or the new one we just created.
    // `vnode` is the vnode that we maybe just created a new element from.
    // now we are going to look at the vnode, and update the element's
    // attributes/classes
    update(el, vnode, env);

    // now recurse, treating el as the parent
    // we will look through the vnode's children now
    render(el, vnode, env);
  }
}

export function mount(el, cmp, env, redraw) {
  REDRAWS.push(redraw = _ => requestAnimationFrame(_ => render(el, { children: cmp() }, env)));
  env = { redraw };
  return redraw() && redraw;
}

export const redraw = i => {
  for (i = 0; i < REDRAWS.length; i++)
    REDRAWS[i]();
};

export function m(tag, ...tail) {
  let k, tmp, classes,
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
  return {[CMP_KEY]: 1, tag, attrs: { ...attrs }, children};
}

m.retain = _ => m(RETAIN_KEY);
