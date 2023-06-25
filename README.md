# umai

A small UI library with an ergonomic API for creating stateless or stateful UIs that will be familiar to users of [Mithril.js](https://github.com/MithrilJS/mithril.js) or React.

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

If you prefer JSX, you can configure your favorite compiler/bundler to transform `m` calls to JSX. For esbuild, set your compilerOptions to:

```json
{
  "compilerOptions": {
    "jsxFactory": "m",
    "jsxFragmentFactory": "'['"
  }
}
```

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
2. A stateless component (A function that returns a virtual DOM node)

```jsx
const el = document.getElementById('app');
const App = () => <p>hello world</p>;
mount(el, App);
```

### Components

`umai` components (stateless components) are functions that return pieces of your UI. Components accept an object of properties as their first argument.

Below is an example of a `User` and a `List` component. The `User` component accepts a prop, `name`. In `List`, we pass different values for the `name` prop to multiple instances of `User` that we wish to display.

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
      <p>there are no users</p>
    }

    {users.length && users.map(user =>
      <p>{user.name}</p>
    )}

    <button onclick={getUsers}>
      fetch users
    </button>
  </div>
);
```

## Stateful Components

In the event that you'd like to use local component state (like `useState` in React), you can create a stateful component. Stateful components are functions that return stateless components (or commonly known in [Mithril.js](https://mithril.js.org) as "closure components").

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

Here is the same Todo component from earlier, but as a stateful component. We can take advantage of `initialProps` to set the default todos.

```jsx
const Todo = ({ defaultTodos }) => {
  let input = '';
  let todos = [...defaultTodos];

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
    <Todo defaultTodos={['walk the dog']} />
    <Todo defaultTodos={['take out trash']} />
    <Todo defaultTodos={['wash the car']} />
  </div>
);
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

In the case that you'd like more control over when to re-render, all components are passed their old props as a second argument. You can use this in conjunction with `m.retain` to return the old virtual DOM node.

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

## Credits

`umai` is a hard fork of [hyperapp](https://github.com/jorgebucaran/hyperapp); credit goes to all Hyperapp maintainers.

`umai` is heavily inspired by [Mithril.js](https://github.com/MithrilJS/mithril.js).