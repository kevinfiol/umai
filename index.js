let NIL = void 0,
  REDRAWS = [],
  CMP_KEY = '__m',
  isArray = Array.isArray,
  isFn = x => typeof x === 'function',
  noop = _ => {},
  isRenderable = v => v === null || typeof v === 'string' || typeof v === 'number' || v[CMP_KEY] || isArray(v),
  makeEl = v => v[CMP_KEY] ? document.createElement(v.tag) : document.createTextNode(v),
  addChildren = (v, children, i) => {
    if (isArray(v)) for (i = 0; i < v.length; i++) addChildren(v[i], children);
    else if (v !== null && v !== false && v !== NIL) children.push(v)
  };

let update = (el, v, env, redraw) => {
  redraw = env ? env.redraw : noop;

  if (!v[CMP_KEY])
    return el.data === v + '' || (el.data = v);

  let i, tmp;
  for (i = 0, tmp = v.classes; i < tmp.length; i++)
    if (!el.classList.contains(tmp[i]))
      el.classList.add(tmp[i]);

  for (i = 0, tmp = el.classList; i < tmp.length; i++)
    if (!v.classes.includes(tmp[i]))
      el.classList.remove(tmp[i]);
    
  for (i in v.attrs)
    if (el[i] !== (tmp = v.attrs[i])) {
      let fn;
      if (tmp === null || tmp === NIL || tmp === true) tmp = '';
      else if (tmp === false) el.removeAttribute(i);
      else if (i.startsWith('on'))
        el[i] = isFn(fn = tmp)
          ? ev => { isFn(fn.then) ? fn(ev).finally(redraw) : (fn(ev), redraw()); }
          : NIL;
      else el.setAttribute(i, tmp);
    }

  for (i = 0, tmp = [...el.getAttributeNames(), ...Object.keys(el)]; i < tmp.length; i++)
    if (!(tmp[i] in v.attrs) && tmp[i] !== 'class') {
      if (tmp[i].startsWith('on') && isFn(el[tmp[i]]))
        el[tmp[i]] = NIL;
      else el.removeAttribute(tmp[i]);
    }
}

export function render(parent, v, env) {
  let i, tmp,
    olds = parent.childNodes || [],
    children = v.children || [],
    news = isArray(children) ? children : [children];

  for (i = 0, tmp = Array(Math.max(0, olds.length - news.length)); i < tmp.length; i++)
    parent.removeChild(parent.lastChild);

  for (i = 0; i < news.length; i++) {
    let child = news[i],
      el = olds[i] || makeEl(child); // get existing node/element (olds[i]) or make new one

    // if old one in that index of parent does not exist, append the new element we just created
    if (!olds[i]) parent.appendChild(el);

    // if old one does exist, but there is a tag mismatch, we need to create a new element, and replace old one
    if ((el.tagName || '') !== (child.tag || '').toUpperCase())
      (el = makeEl(child)) && parent.replaceChild(el, olds[i]);

    // at this point, el is either the old Element,
    // or the new one we just created.
    // child is the vnode that we maybe just created a new element from.
    // now we are going to look at the vnode, and update the element's
    // attributes/classes
    update(el, child, env);

    // now recurse, treating el as the parent
    // we will look through the vnode's (child) children now
    render(el, child, env);
  }
};

export function mount(el, cmp, env) {
  env = { redraw: _ => requestAnimationFrame(_ => render(el, { children: cmp() }, env)) };
  return REDRAWS.push(env.redraw) && env.redraw;
};

export const redraw = _ => {
  for (let i = 0; i < REDRAWS.length; i++)
    REDRAWS[i]();
}

export function m(...args) {
  let attrs = {},
    [head, ...tail] = args,
    [tag, ...classes] = head.split('.'),
    children = [];

  if (tail.length && !isRenderable(tail[0]))
    [attrs, ...tail] = tail;

  if (attrs.class) classes = [...classes, attrs.class];
  attrs = {...attrs};
  addChildren(tail, children); // will recurse through tail and push valid childs to `children`
  return {[CMP_KEY]: 1, tag: tag || 'div', attrs, classes, children};
};