# umai

![umai](./umai.png)

*Logo by [twitter.com/haggle](https://twitter.com/haggle)*

A [small](https://bundlephobia.com/package/umai) UI library with an ergonomic API.

## Install

```
npm install umai
```

## Usage

```js
import { m, mount } from 'umai';

let count = 1;

const App = () => (
  m('div',
    m('h1', `Count: ${count}`),
    m('button', { onclick: () => count += 1 }, 'increment')
  )
);

mount(document.body, App);
```

[Live Example](https://flems.io/#0=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-EKzRqQsmD0GKsqCng5Z-yQczFI8SRpwoekkJVchpYpFYKIUmAzumYnCEISIrBmCmoANSOtSWTNQQgoAAGEulQRxRan1mIkFyHrP6wZgaSkkt8WU-xsBvorIwGrNZGy3nWxbmraIojdkYFRQRDe00wDArltrLFjdoidz2dYg5wtvoOKCgmCtLDhZZstUMpJhq8jZOkGLE1RhQ1WqEDah29qUhUGdUkYkfahnkCoEzMKUakWDFJnixZjSknfQnQshpdzbSsGmswQtoLgAUuucSE6mSO2mrkC3XI9ZUhJFYPOLeTDK2sO9YMih2a0ViJ+WEjVryS3xMocDeBn0fwWIXjMzRCCW4pvmSmndEHUF90A6HYD316XzIeuhiD8LhZgc0eHSDkQEFUE-QRAAarZK9zTIhIdxCh7OONsH4ciIRmjSQxZLuCPAfIIFCJ5GITi5W9ZVma1tCdY6qH7rfXrXLOj-doiwpxrhmtNGcPCpmVsnZLdl1bpuUCH8unz7iJpUga9NKOkBt6S3FtmJprPxBXLTdxmdOn2MygreaD6NNwhcprDoG1N3SI0kVz+LGmEubnJ3ADnjpOaM40v+zmEseaAUe7UbsrkQHdu4+ZXjnG4H0eZ7xvMC3sqs24yI1HbNCFwJIY1uBnT1Z8mAQddrmCmHURsOQliEBDva1ec9USHj0aoMANpNBcBtNiJUpQalgHJyttgpQvV+qCCgBPeAS2QCdOuoXdbC2YbJPgJCJANByDHaSOHWI52Z6fSgm4t213jticG9EFIzpRB62+pIT7QZvpAYMZbJuYByCSGXmsy2d0m6RHIM6ZeKQkjPzcSDsHZG3Yo6ZjDuHwbohY+dUzFH+PbQeaye9z7Gxvu-f+1JxMchgfkCDOD76kO6e4-IBseHiOKG4BB4ztHPOGeY-Z3vesMONjmAJwziXxPUjxP0EGdtUSyd6wR6RvFPHWB8ciYJtn2PRew6J2JvmusMdrN4Gj+T8TnQaA2Irt7P25BBgRwmZHoOieed6mliYHNrnjNe8N8WW9ftbzHQD2n9OLtJtYOQCAe8QcXde8rjYCOgdvzkKb92rOsci91+DzVsfsEA6+p9D2UPoiE6XjUihoc7oQBk9z3gtpJBjtcTXuQJBobV8Y4E9ZSPcDBM+ubnNGXcDZ6N86MdtWW+07uh36Ifeh9ov76P2HTMUGat4nIKRU+XWt+zsDF+0feJV772r7jvH+PVA2cP-vQSLe7JX3Do3sByCb6kSjBfd+b+UMf2v20E+XVE8HcncOM28m4Tc3dHVl5683FG9-d0tYkwpKEgsbsYC5YbsAEmg0kxg0c5BhlR8D0ANwDj4skKVjVTVzVWth1WAx0YgCkmYz0gFZAY4tsQ4wBnQeNfZQZXZYZApgoVFuQ1FnkeEbRXE+D60AFMk9pMZVIjo2kTovdDQ-4K4CAS4fcJFFYCs8Cp4mYgVy0akHkkARodUm5kDCV-sMB4xR4H1xMqDmANBpZvoaA4g1ko44h+lysk1KBvkkBy42koBpp5C94JMj5hZTp4koB+lYAaASASA+U5oEFIj-QYiPYkjojYj4j6BbRztJsgQCA95eEVAAwH0lAMAlBbQM4CAVpJY4YlA5gQBbRnCtY0iUju5SDYkUFPByBYBbt+YEECBHU7B6iKjBjVkdUM0k0Bi6doYGE6ilBHVPBtElAkB18CBEioiUi6cAFsCYg3EVACwQAaYDtoYVAkABCeRuBhC3YfDy48sXExt2JAVyskAVAmgmhJBn11QDgg5JBRIpkGis0C1JBATK195SZzldYrw1k3ZwTXx5ZvYDpWZmZgAuNCZPAAAJZYAAWQABk7BRAaAtBtBCSlBdlfl0jWA31ukUgTEfctZzijDjo0URD+97pdRrYHNYwNRvwBUCIH91UtY4YP5UhsDa1goYMag6h6gg5qgABHKUJYDYQ4BITGAAMTqHoDfm7kSyrilPnG+glOrnqGmlJn4AACUX1rZrYNBPBxDiUK0jSg5gBSD0t6sxYfxes2sg8qAQ8XVo9jt5wTTn0+Eg55ZFYbQnwRRWggILhVp+RFRWEDZoBgE-RJwCgLSaABodg-dDAMyBoJVOVBAZU2UdhFpawBg8yfx1TNESy3hyB+huoVtrpMYyBGAUAjCrwpoZo545oRAVo1ptsNpvwRBsJChihSgXwKhy5pBdSGhmhSyTxxxUztxpA-xPUMRvxsRphZh5x8RCZGgAARKVecSyXgHEllE4eALc+AAAZQ4QdkfXQgpRxB2DXI3KxBxEfNcG41YHAgEB4zNFCT8mGEmG3NXO+HXINk3M-JHAEklIaC-OmmkCvGllQsjNHIhF3DwkeFBHBB4h1BuGonuG1DMm6AYmIp+HOB2DYlblwtOB4j4m-LgoXV2CKE-Cgo-OmEonDFEiPHEmylhFEGvA0HtVxFAvoxcUKHYsxDIhxCqm0GEv4nqkiXVh0gCEnFiGdEgHlmACMhMiomKheg+McWMm-APMImIlIi-J9ACjjATCTBhEdFIszFqjqmpAEupCklCkMoegUl5WUjUthDmw0i0kMr0gZEMn8g1D-AIoih2CshNDmzcppEchUhUhcjdH4ENC2WW00u0s0HiigB0FSn4A8ssG0BUrKskkakCoqhjHykbCKkCpKjKjqrrmqggBuDmECoAWShqs8uagknhDaiXNHKwp3JEmGFEBPCoAEtEEwocB0mkugvoA0nEuSoCBBGOHovOA0nrISELmkDPiOrUC6EhGStSvhB0BmpcEjMnLfFFTZV-G+GLO-DAkgmglOrggQhSG6j4ByGIB4xEGdBoA4M4HwCbMFmCGGiMIAGYuzZp6A+zuBYi-qhytoQBnQ1gOQxyQbgxIh2g-pTA+AIhFjpAABiK8Km6mlIQIUIPIXkcmmoZmqAWm7SLGqAYuaQEqtxOKooKBAQUwIiSAWADkXkF8VFEgFQTM+ANmxsvqZsxE1skAK8R5LAKac6oAA)


If you prefer JSX, you can configure your favorite compiler/bundler to transform `m` calls to JSX. For esbuild, set your compilerOptions to:

```json
{
  "compilerOptions": {
    "jsxFactory": "m",
    "jsxFragmentFactory": "'['"
  }
}
```

See [test/esbuild.js](./test/esbuild.js) for an example esbuild configuration.

In order to use JSX, the factory function (`m`) must be imported at the top of each of your JSX files.

```jsx
import { m } from 'umai'; // this is required to use JSX

const MyComponent = () => (
  <div>Hello, JSX!</div>
);
```

### Mounting

Use `mount` to mount your application on an element. `mount` takes two arguments:

1. An [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)
2. A stateless component (a function that returns a virtual DOM node)

```jsx
const el = document.getElementById('app');
const App = () => <p>hello world</p>;
mount(el, App);
```

### Components

`umai` components (stateless components) are functions that return pieces of your UI. Components accept an object of properties (`props`) as their first argument.

Below is an example of a `User` and a `List` component. The `User` component accepts a prop, `name`. In `List`, we pass different values for the `name` prop to different instances of `User` that we wish to display.

```jsx
const User = (props) => (
  <div class="user">
    <h2>{props.name}</h2>
  </div>
);

const List = () => (
  <div class="users">
    <User name="kevin" />
    <User name="rafael" />
    <User name="mike" />
  </div>
);
```

### Passing `children`
`children` are passed as part of the `props` object. They can be used to compose multiple components. This is especially helpful when creating layouts or wrapping styled elements.

```jsx
const Layout = ({ title, children }) => (
  <div class="container">
    <h1 class="page-title">{title}</h1>
    {children}
  </div>
);

const UserPage = () => (
  <Layout title="User Page">
    <p>Welcome to the user page!</p>
  </Layout>
);
```

### Redraws & State Management

`umai` uses global redraws by default. This means event handlers defined in your app will trigger full component tree re-renders. This simplifies state management so that any variable within the scope of your component is valid state.

```jsx
let input = '';
let todos = ['take out trash', 'walk the dog'];

const Todo = () => (
  <div>
    <input
      type="text"
      value={input}
      oninput={(ev) => input = ev.target.value}
    />

    <button onclick={() => { todos.push(input); input = ''; }}>
      add todo
    </button>

    <ul>
      {todos.map(todo =>
        <li>{todo}</li>
      }
    </ul>
  </div>
);
```

Triggering manual redraws is also possible using `redraw`. This is particularly helpful when dealing with effects or asynchronous code.

```jsx
import { m, redraw } from 'umai';
import { fetchUsers } from './api.js';

let users = [];

const getUsers = () => {
  fetchUsers()
    .then(res => users.push(res))
    .finally(redraw);
};

const Dashboard = () => (
  <div>
    {!users.length &&
      <p>There are no users!</p>
    }

    {users.length && users.map(user =>
      <p>{user.name}</p>
    )}

    <button onclick={getUsers}>
      Retrieve Users
    </button>
  </div>
);
```

### Stateful Components

To use local component state (like `useState` in React), you can create a stateful component. Stateful components are functions that return stateless components (or commonly known in [Mithril.js](https://mithril.js.org) as "closure components").

```jsx
const StatefulComponent = (initialProps) => {
  let localVariable = 'hello world';

  return (props) => (
    <div>
      {localVariable}
    </div>
  );
};
```

In the example above, the inner function (the stateless component) is run on every re-render, whereas the code before that (initializing `localVariable`) is only run once when the component mounts.

Here is the same Todo component from earlier, but as a stateful component. We can take advantage of `initialProps` to set the initial todos.

```jsx
const Todo = ({ initialTodos }) => {
  let input = '';
  let todos = [...initialTodos];

  return () => (
    <div>
      <input
        type="text"
        value={input}
        oninput={(ev) => input = ev.target.value}
      />

      <button onclick={() => { todos.push(input); input = ''; }}>
        add todo
      </button>

      <ul>
        {todos.map(todo =>
          <li>{todo}</li>
        }
      </ul>
    </div>
  );
};
```

Now that this component is stateful, I can mount multiple `Todo` components in my app, each containing their own state.

```jsx
const App = () => (
  <div>
    <Todo initialTodos={['walk the dog']} />
    <Todo initialTodos={['take out trash']} />
    <Todo initialTodos={['wash the car']} />
  </div>
);
```

### `dom` property

DOM nodes are passed to the `dom` handler immediately upon being created.

```jsx
const Description = () => (
  /* logs `p` Node to the console */
  <p dom={(node) => console.log(node)}>
    hello world
  </p>
);
```

You may optionally return a function that will be invoked upon Node removal.
```jsx
const Description = () => (
  <p dom={(node) => {
    console.log('created p node!');
    return () => console.log('removed p node!');
  }}>
    hello world
  </p>
);
```

When used with stateful components, the `dom` property may be used to store references to DOM elements (similar to `ref`/`useRef` in React). This is useful for third-party library integration.
```jsx
const Scrollbox = () => {
  let containerEl;

  return ({ loremIpsum }) => (
    <div dom={(node) => containerEl = node}>
      {loremIpsum}

      <button onclick={() => containerEl.scrollTop = 0;}>
        scroll to top
      </button>
    </div>
  );
};
```

### `onRemove` hook

You can trigger events when a stateful component unmounts using the `onRemove` hook.

```jsx
import { m, onRemove } from 'umai';

const Field = () => {
  console.log('mounted Field!');

  onRemove(() => {
    console.log('unmounted Field!')
  });

  return () => (
    <div>
      ...
    </div>
  );
};
```

### Memoization

Memoization allows you to skip re-rendering a component if its props are unchanged between re-renders. `umai` provides a convenience utility for memoizing components using shallow equality checks.

```jsx
import { m, memo } from 'umai';

// User will not re-render if all props are strictly equal `===`
const User = memo((props) => (
  <div>
    {props.name}
  </div>
));
```

If you'd like more control over when to re-render, all components are passed their old props as a second argument. You can use this in conjunction with `m.retain` to return the old virtual DOM node.

```jsx
import { m } from 'umai';

const User = (props, oldProps) => {
  if (props.name === oldProps.name)
    return m.retain(); // return the old virtual DOM node

  return (
    <div>
      {props.name}
    </div>
  );
};
```

### Fragments

`umai` features minimal fragment support. There are two main caveats to keep in mind:
  * Keyed fragments are not supported
  * Components must return virtual DOM nodes.

```jsx
const Users = () => (
  <>
    <p>kevin<p>
    <p>rafael</p>
  </>
);

const App = () => (
  <div>
    {/* ✗ Not OK! umai components must return a virtual DOM node */}
    <Users />
    
    {/* ✓ OK! A Factory Function that returns a fragment */}
    {Users()}
  </div>
);
```

If you are using the hyperscript API (`m`), arrays are interpreted as fragments.

```jsx
const Users = () => [
  m('p', 'kevin'),
  m('p', 'rafael')
];

const App = () => (
  m('div',
    Users()
  )
);
```

### Class Utilities

Both `className` and `class` are valid properties when defining element classes. If both are present, `className` takes precedence.

#### Class String Builder

You may pass an object as an element class name where the keys correspond to CSS class names. `umai` will construct a class string based on the boolean values of each object key. This is helpful when conditionally applying CSS styles and complements CSS Modules or utility CSS nicely.

```jsx
const Modal = ({ isOpen = true }) => (
  <div class={{ 'modal--open': isOpen, 'bg-green': false, 'font-xl': true }}>
    ...
  </div>
);

// The above will render:
// <div class="modal--open font-xl">...</div>
```

#### Hyperscript Class Helper

If you are using the hyperscript API, you may append classes delimited with `.` as part of the element tag.

```js
const Todo = () => (
  m('div.todo.font-sm',
    '...'
  )
);

// The above will render:
// <div class="todo font-sm">...</div>
```

This can also be used with the class string builder to define classes that should always be present.

```js
const Modal = ({ isOpen = true }) => (
  m('div.font-xl', { class: { 'modal--open': isOpen, 'bg-green': false } },
    '...'
  )
);

// The above will render:
// <div class="modal--open font-xl">...</div>
```

## Credits

`umai` is a hard fork of [hyperapp](https://github.com/jorgebucaran/hyperapp). Credit goes to all Hyperapp maintainers.

`umai` is heavily inspired by [Mithril.js](https://github.com/MithrilJS/mithril.js).
