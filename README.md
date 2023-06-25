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

The following examples will use JSX.

### Passing `props`

```jsx
const User = ({ name }) => (
  <div class="user">
    <h2>{name}</h2>
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

### State Management

`umai` uses global redraws by default. What this means is event handlers defined in your app will trigger full component tree rerenders. This simplifies state management so that any variable within the scope of your component is valid state.

```jsx
let input = '';
let todos = [];

const Todo = () => (
  <div>
    <input type="text" value={input} oninput={(ev) => input = ev.target.value} />
    <button onclick={() => { todos.push(input); input = ''; }}>
      add todo
    </button>
    <ul>
      {todos.map(todo =>
        <li>{todo}</li>
      )}
    </ul>
  </div>
);
```

In the event that you'd like to use local component state (like `useState` in React), you can create a stateful component. Stateful components are functions that return stateless components (or commonly known in [Mithril.js](https://mithril.js.org) as "closure components"). Stateful components look like this:

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

Here is the same Todo component as above, but as a stateful component.

```jsx
const Todo = () => {
  let input = '';
  let todos = [];

  return () => (
    <div>
      <input type="text" value={input} oninput={(ev) => input = ev.target.value} />
      <button onclick={() => { todos.push(input); input = ''; }}>
        add todo
      </button>
      <ul>
        {todos.map(todo =>
          <li>{todo}</li>
        )}
      </ul>
    </div>
  );
};
```

## Credits

`umai` is a hard fork of [hyperapp](https://github.com/jorgebucaran/hyperapp); credit goes to all Hyperapp maintainers.

`umai` is heavily inspired by [Mithril.js](https://github.com/MithrilJS/mithril.js).