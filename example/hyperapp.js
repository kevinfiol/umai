var SSR_NODE = 1
var TEXT_NODE = 3
var EMPTY_OBJ = {}
var EMPTY_ARR = []
var SVG_NS = "http://www.w3.org/2000/svg"

var id = (a) => a
var map = EMPTY_ARR.map
var isArray = Array.isArray

var createClass = (obj) => {
  var out = ""

  if (typeof obj === "string") return obj

  if (isArray(obj)) {
    for (var k = 0, tmp; k < obj.length; k++) {
      if ((tmp = createClass(obj[k]))) {
        out += (out && " ") + tmp
      }
    }
  } else {
    for (var k in obj) {
      if (obj[k]) out += (out && " ") + k
    }
  }

  return out
}

var shouldRestart = (a, b) => {
  for (var k in { ...a, ...b }) {
    if (typeof (isArray(a[k]) ? a[k][0] : a[k]) === "function") {
      b[k] = a[k]
    } else if (a[k] !== b[k]) return true
  }
}

var patchSubs = (oldSubs, newSubs = EMPTY_ARR, dispatch) => {
  for (
    var subs = [], i = 0, oldSub, newSub;
    i < oldSubs.length || i < newSubs.length;
    i++
  ) {
    oldSub = oldSubs[i]
    newSub = newSubs[i]

    subs.push(
      newSub && newSub !== true
        ? !oldSub ||
          newSub[0] !== oldSub[0] ||
          shouldRestart(newSub[1], oldSub[1])
          ? [
              newSub[0],
              newSub[1],
              (oldSub && oldSub[2](), newSub[0](dispatch, newSub[1])),
            ]
          : oldSub
        : oldSub && oldSub[2]()
    )
  }
  return subs
}

var getKey = (vdom) => (vdom == null ? vdom : vdom.key)

var patchProperty = (node, key, oldValue, newValue, listener, isSvg) => {
  if (key === "style") {
    for (var k in { ...oldValue, ...newValue }) {
      oldValue = newValue == null || newValue[k] == null ? "" : newValue[k]
      if (k[0] === "-") {
        node[key].setProperty(k, oldValue)
      } else {
        node[key][k] = oldValue
      }
    }
  } else if (key[0] === "o" && key[1] === "n") {
    if (
      !((node.events || (node.events = {}))[(key = key.slice(2))] = newValue)
    ) {
      node.removeEventListener(key, listener)
    } else if (!oldValue) {
      node.addEventListener(key, listener)
    }
  } else if (!isSvg && key !== "list" && key !== "form" && key in node) {
    node[key] = newValue == null ? "" : newValue
  } else if (newValue == null || newValue === false) {
    node.removeAttribute(key)
  } else {
    node.setAttribute(key, newValue)
  }
}

var createNode = (vdom, listener, isSvg) => {
  // 
  var props = vdom.props
  var node =
    vdom.type === TEXT_NODE
      ? document.createTextNode(vdom.tag)
      : (isSvg = isSvg || vdom.tag === "svg")
      ? document.createElementNS(SVG_NS, vdom.tag, props.is && props)
      : document.createElement(vdom.tag, props.is && props)

  for (var k in props) {
    patchProperty(node, k, null, props[k], listener, isSvg)
  }

  for (var i = 0; i < vdom.children.length; i++) {
    node.appendChild(
      createNode(
        (vdom.children[i] = maybeVNode(vdom.children[i])),
        listener,
        isSvg
      )
    )
  }

  return (vdom.node = node)
}

var patch = (parent, node, oldVNode, newVNode, listener, isSvg) => {
  
  if (oldVNode === newVNode) {
  } else if (
    oldVNode != null &&
    oldVNode.type === TEXT_NODE &&
    newVNode.type === TEXT_NODE
  ) {
    if (oldVNode.tag !== newVNode.tag) node.nodeValue = newVNode.tag
  } else if (oldVNode == null || oldVNode.tag !== newVNode.tag) {
    node = parent.insertBefore(
      createNode((newVNode = maybeVNode(newVNode)), listener, isSvg),
      node
    )
    if (oldVNode != null) {
      parent.removeChild(oldVNode.node)
    }
  } else {
    var tmpVKid
    var oldVKid

    var oldKey
    var newKey

    var oldProps = oldVNode.props
    var newProps = newVNode.props

    var oldVKids = oldVNode.children
    var newVKids = newVNode.children

    var oldHead = 0
    var newHead = 0
    var oldTail = oldVKids.length - 1
    var newTail = newVKids.length - 1

    isSvg = isSvg || newVNode.tag === "svg"

    // 1. patch the properties first
    for (var i in { ...oldProps, ...newProps }) {
      // if the property is value, selected, or checked, compare the property on the actual dom NODE to newProps
      // otherwise, compare oldProps[i] to newProps[i]
      if (
        (i === "value" || i === "selected" || i === "checked"
          ? node[i]
          : oldProps[i]) !== newProps[i]
      ) {
        patchProperty(node, i, oldProps[i], newProps[i], listener, isSvg)
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
        break
      }

      patch(
        node,
        oldVKids[oldHead].node,
        oldVKids[oldHead],
        (newVKids[newHead] = maybeVNode(
          newVKids[newHead++],
          oldVKids[oldHead++]
        )),
        listener,
        isSvg
      )
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
        break
      }

      patch(
        node,
        oldVKids[oldTail].node,
        oldVKids[oldTail],
        (newVKids[newTail] = maybeVNode(
          newVKids[newTail--],
          oldVKids[oldTail--]
        )),
        listener,
        isSvg
      )
    }

    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        node.insertBefore(
          createNode(
            (newVKids[newHead] = maybeVNode(newVKids[newHead++])),
            listener,
            isSvg
          ),
          (oldVKid = oldVKids[oldHead]) && oldVKid.node
        )
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        node.removeChild(oldVKids[oldHead++].node)
      }
    } else {
      // grab all the old keys from the old children
      for (var keyed = {}, newKeyed = {}, i = oldHead; i <= oldTail; i++) {
        if ((oldKey = oldVKids[i].key) != null) {
          keyed[oldKey] = oldVKids[i]
        }
      }

      while (newHead <= newTail) {
        // get the key for the current old child
        // while you're at it, assign oldVKid (which is undefined on the first iteration of this loop)
        // to the current child at the index oldHead (which we will increment)
        oldKey = getKey((oldVKid = oldVKids[oldHead]))

        // get the key for the current new child
        // while we're at it, assign the current index at newVKids
        // use maybeVnode to normalize the vnode at newVKids[newHead].
        // oldVKid is passed in solely for memoization purposes, so can ignore that for now
        newKey = getKey(
          (newVKids[newHead] = maybeVNode(newVKids[newHead], oldVKid))
        )

        // if we have this oldKey in newKeyed
        // or if newKey is defined and is equal to the *next* old child's key
        if (
          newKeyed[oldKey] ||
          (newKey != null && newKey === getKey(oldVKids[oldHead + 1]))
        ) {
          // then you can remove the old child at the current oldHead index
          // assuming it's key is null or undefined
          if (oldKey == null) {
            node.removeChild(oldVKid.node)
          }
          // then increment oldHead and restart the loop
          oldHead++
          continue
        }

        // otherwise, if the new child is keyless, and the oldVNode is not a text node
        // (remember, this is not a child, oldVNode is the PARENT during this call of patch)
        if (newKey == null || oldVNode.type === SSR_NODE) {
          if (oldKey == null) {
            patch(
              node,
              oldVKid && oldVKid.node,
              oldVKid,
              newVKids[newHead],
              listener,
              isSvg
            )
            newHead++
          }
          oldHead++
        } else {
          if (oldKey === newKey) {
            patch(
              node,
              oldVKid.node,
              oldVKid,
              newVKids[newHead],
              listener,
              isSvg
            )
            newKeyed[newKey] = true
            oldHead++
          } else {
            if ((tmpVKid = keyed[newKey]) != null) {
              patch(
                node,
                node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),
                tmpVKid,
                newVKids[newHead],
                listener,
                isSvg
              )
              newKeyed[newKey] = true
            } else {
              patch(
                node,
                oldVKid && oldVKid.node,
                null,
                newVKids[newHead],
                listener,
                isSvg
              )
            }
          }
          newHead++
        }
      }

      while (oldHead <= oldTail) {
        if (getKey((oldVKid = oldVKids[oldHead++])) == null) {
          node.removeChild(oldVKid.node)
        }
      }

      for (var i in keyed) {
        if (newKeyed[i] == null) {
          node.removeChild(keyed[i].node)
        }
      }
    }
  }

  return (newVNode.node = node)
}

var propsChanged = (a, b) => {
  for (var k in a) if (a[k] !== b[k]) return true
  for (var k in b) if (a[k] !== b[k]) return true
}

var maybeVNode = (newVNode, oldVNode) =>
  newVNode !== true && newVNode !== false && newVNode
    ? typeof newVNode.tag === "function"
      // in the event that newVnode.tag is a function, there is some logic here for memoization
      // can ignore this for now
      ? ((!oldVNode ||
          oldVNode.memo == null ||
          propsChanged(oldVNode.memo, newVNode.memo)) &&
          ((oldVNode = newVNode.tag(newVNode.memo)).memo = newVNode.memo),
        oldVNode)
      // by default if newVnode is a regular vnode, just return it
      : newVNode
    // if the newVnode is false\true or just falsey, return an empty text node
    : text("")

var recycleNode = (node) =>
  node.nodeType === TEXT_NODE
    ? text(node.nodeValue, node)
    : createVNode(
        node.nodeName.toLowerCase(),
        EMPTY_OBJ,
        map.call(node.childNodes, recycleNode),
        SSR_NODE,
        node
      )

var createVNode = (tag, { key, ...props }, children, type, node) => ({
  tag,
  props,
  key,
  children,
  type,
  node,
})

export var memo = (tag, memo) => ({ tag, memo })

export var text = (value, node) =>
  createVNode(value, EMPTY_OBJ, EMPTY_ARR, TEXT_NODE, node)

export var h = (tag, { class: c, ...props }, children = EMPTY_ARR) =>
  createVNode(
    tag,
    { ...props, ...(c ? { class: createClass(c) } : EMPTY_OBJ) },
    isArray(children) ? children : [children]
  )

export var app = ({
  node,
  view,
  subscriptions,
  dispatch = id,
  init = EMPTY_OBJ,
}) => {
  // 
  var vdom = node && recycleNode(node)
  var subs = []
  var state
  var busy

  var update = (newState) => {
    if (state !== newState) {
      if ((state = newState) == null) dispatch = subscriptions = render = id
      if (subscriptions) subs = patchSubs(subs, subscriptions(state), dispatch)
      if (view && !busy) requestAnimationFrame(render, (busy = true))
    }
  }

  var render = () =>
    (node = patch(
      node.parentNode,
      node,
      vdom, // oldVnode
      (vdom = view(state)), // newVnode (this assignment also makes it so vdom is the oldVnode next time! clever)
      listener,
      (busy = false)
    ))

  var listener = function (event) {
    dispatch(this.events[event.type], event)
  }

  return (
    (dispatch = dispatch((action, props) =>
      typeof action === "function"
        ? dispatch(action(state, props))
        : isArray(action)
        ? typeof action[0] === "function"
          ? dispatch(action[0], action[1])
          : action
              .slice(1)
              .map(
                (fx) => fx && fx !== true && (fx[0] || fx)(dispatch, fx[1]),
                update(action[0])
              )
        : update(action)
    ))(init),
    dispatch
  )
}
