# umai

![umai](./umai.png)

*Logo by [twitter.com/haggle](https://twitter.com/haggle)*

A small UI library with a familiar API.

![bundle.js badge](https://deno.bundlejs.com/badge?q=umai)

## Install

```
npm install umai
```

## Usage

```jsx
import { m, mount } from 'umai';

let count = 1;

const App = () => (
  <div>
    <h1>Count: {count}</h1>
    <button onclick={() => count += 1}>
      increment
    </button>
  </div>
);

mount(document.body, App);
```

See [Examples](#examples).

### JSX

If you prefer JSX, you can configure your favorite compiler/bundler to transform `m` calls to JSX. For esbuild, see [Using JSX without React](https://esbuild.github.io/content-types/#using-jsx-without-react). Also, see [test/esbuild.js](./test/esbuild.js) for an example esbuild configuration.

In order to use JSX, the factory function (`m`) must be imported at the top of each of your JSX files.

```jsx
import { m } from 'umai'; // this is required to use JSX

const MyComponent = () => (
  <div>Hello, JSX!</div>
);
```

Alternatively, if you'd like JSX-like syntax without a build step, [developit/htm](https://github.com/developit/htm) pairs nicely with `umai`.
```jsx
import htm from 'htm';
import { m } from 'umai';

const html = htm.bind(m);

const MyComponent = () => html`
  <div>Hello, htm!</div>
`;
```

### Hyperscript

You can use `umai` without JSX or htm with the included hyperscript API `m`.
```js
import { m } from 'umai';

const MyComponent = ({ name }) => (
  m('div', `Hello, ${name}!`)
);

const App = () => (
  m('div',
    m(MyComponent, {
      name: 'Hyperscript'
    }) 
  )
);
```

Using the hyperscript API also allows you to use the [hyperscript class helper](#hyperscript-class-helper).

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
`children` are passed as part of the `props` object. They can be used to compose multiple components. This is helpful when creating layouts or wrapping styled elements.

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

`umai` uses global redraws. This means event handlers defined in your app will trigger full component tree re-renders. This simplifies state management so that any variable within the scope of your component is valid state.

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

Triggering manual redraws is also possible using `redraw`. This is helpful when dealing with effects or asynchronous operations.

```jsx
let time = '⏰ starting...';

setInterval(() => {
  time = new Date().toLocaleTimeString();
  redraw(); // this tells umai to rerender
}, 1000);

const Clock = () => (
  <div>
    <h1>{time}</h1>
  </div>
);
```

If your event handler returns a promise, `redraw` is automatically called for you when the promise has settled.

```jsx
import { m } from 'umai';
import { fetchUsers } from './api.js';

let users = [];

const getUsers = () => {
  fetchUsers()
    .then(res => users.push(res)); // no need to call redraw!
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

Stateful components are functions that return stateless components.

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

In the example above, the inner function (the stateless component) is run on every re-render, whereas the outer function (initializing `localVariable`) is only run once when the component initializes.

Here is the same Todo component from earlier, but as a stateful component. We can take advantage of `initialProps` to set the initial `todos`, which can be modified and have its changes reflected in subsequent renders.

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

### `dom` and `remove` properties

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

When used with stateful components, the `dom` property may be used to store references to DOM elements (similar to `ref`/`useRef` in React).
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

`dom` is also useful for third-party library integration. See [examples](#examples) for working examples.
```jsx
import { m } from 'umai';
import Chart from 'chart.js';

const ChartApp = () => {
  let chart;

  const onMount = (node) => {
    chart = new Chart(node, { /* chart.js options */ });

    return () => {
      // cleanup on node removal
      chart.destroy();
    };
  };

  return () => (
    <canvas dom={onMount} />
  );
};
```

In cases where you'd like to invoke a method only on Node removal and not creation, you may pass a callback to the `remove` property.
```jsx
const MyComponent = () => {
  console.log('initialized MyComponent!');

  const onRemove = () => {
    console.log('unmounted MyComponent!');
  };

  return () => (
    <div remove={onRemove}>
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

### Keys
Use `key` for rendering lists where the DOM element order matters. Prefer strings or unique ids over indices when possible.

```jsx
import { emojis } from './emojis.js'; 

const food = [
  { id: 1, name: 'apple' },
  { id: 2, name: 'banana' },
  { id: 3, name: 'carrot' },
  { id: 4, name: 'doughnut' },
  { id: 5, name: 'egg' }
];

const FoodItem = (initialProps) => {
  const emoji = emojis[initialProps.name];
  
  return ({ name }) => (
    <p>{emoji} = {name}</p>
  );
};

const App = () => (
  <div>
    {food.map((item) =>
      <FoodItem
        key={item.id}
        name={item.name}
      />
    )}
  </div>
);
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
    {/* ✗ Not OK! umai components must return a virtual DOM node. */}
    <Users />
    
    {/* ✓ OK! A factory function that returns a fragment. */}
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

/*
The above renders:
  <div>
    <p>kevin</p>
    <p>rafael</p>
  </div>
*/
```

### Class Utilities

Both `className` and `class` are valid properties when defining element classes. If both are present, `className` takes precedence.

#### Class String Builder

You may pass an object as an element class name where the keys correspond to CSS class names. `umai` will construct a class string based on the boolean values of each object property. This is helpful when conditionally applying CSS styles, and complements CSS Modules and utility CSS libraries nicely.

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

### Using raw HTML

**Note:** Make sure to sanitize HTML generated by user input.

```jsx
const html = '<em>this should be emphasized</em>';

const Comment = ({ userName }) => (
  <article>
    <span innerHTML={html} />
  </article>
);

// The above will render:
// <article><span><em>this should be emphasized</em></span></article>
```

## Examples

* [Counter](https://flems.io/#0=N4IgtglgJlA2CmIBcB2AbAOgCwCYA0IAZhAgM7IDaoAdgIZiJIgYAWALmLCAQMYD21NvEHIQAYT4BXQfABO3EKXgIebCAPJMADKhABfPDXqNmAK3K8BQkUwhgADn1lsABMBdg8HqYJd6XhLJ8YC4A5JJgtBChANwAOtQJCK780q4AvC5a8YnU-NSkrhJpci6ZABQAlGUAfC7lCS4e5aFQEABuoXiNTc2hLACMXS6pgpXd1L19AEaSbGwCw+4CPLAQPADWSPXV6XWjrgDUmQN+XqEQebLwDIKhlT0P1JU5CWA+bOVQfDwRwmwYaZ8KAATy8xRksheCn4DhIcmQ1EksFgBCUKjUGlEOgAzDh9IYQHQGKIMDxSBYQPlrGxREDQcBIrIAOaXJBYLT2AAeLlocz4MUiXIAtAB3aBsFhINAAVk5XJia2o8GFLHgEGZ7CQAwwaBihCswtIEAAXvBtQAObkxfiwJxIADEWGdMXstBgl2ZSC0LgG8r09LBs3mAjwl3sc2ABsEwsI9BIIKQ72ofFIbp48D0CnR8FU6gK2O1OJl+gAunogA)

* [Clock](https://flems.io/#0=N4IgtglgJlA2CmIBcB2AbAOgCwCYA0IAZhAgM7IDaoAdgIZiJIgYAWALmLCAQMYD21NvEHIQAYVh8eAa24hS8BDzYQB5JgAYkAVhABfPDXqNmAK3K8BQkUwhgADnwBObAATBXYPJ74BXQd5O8FBOtADurnquhE58YK4A5L5gtBAJANwAOtTZCG4qDK4AvImAD8SupGy0LhDUAOYYjRnZ2QpsAJKC8E4AbrSwABQDAJTFAHzu2a6uBfDFrtTwEQAitEIjGGx8ADJS-fAAKnbwAMpsTrV1I1nU00Eh4dfZBq4AjBofwzfZ-NSVrhIpNJ5iNxq4BlNPAMElAID0EnhIdMwNCWK8ETNjsNEbdXMNsl8WtQwH5BAMoFJksI2BgAEZ8KAAT28gJkXzk-AcJG6yGovlgsAICiUKjUoi0AGYABz6QwgOgMUQYHikCwgX7WNiielM4ApJx1WpILAaewAD1ctF8W3SKTNAFowtA2CwkGhtKazelYLV4PaWPAIHV2EhXhg0OlCFZ7aQIAAveChqXm9L8SROJAAYiwOfS9loMEuSA0b09eh1zNp1q21DwtXs1uAUcE9sI9BIjKQJOofFI+Z48D0cmF8GUqj+4tDEt0egAunogA)

* [htm + Stateful Component](https://flems.io/#0=N4IgtglgJlA2CmIBcA2ArAOjQJgDQgDMIEBnZAbVADsBDMRJEDACwBcxYR8BjAeytbwByEGzAACeAA86ABwRcQJeAm6sI-MowAMSAIx6QAX1zU6DJgCsyPfoOGMIYWbwBOrcWPEFXvCQHIxfwBuAB0qJxd3cWBxMFw43gBXAXEjb18ApLAaCBDw8L4qEg8xWHEAXk92DAAjCCooAAowAEowqkLNDwBBWFgAYRpZEkrxJtbKgD4Y8PFxBA8ANxpYJPgx-3yqebnxV3hWJNcdienqjgADPfmAHigIJamb+fFb2SmAFQBPWQ2SPwbADubigo1YvHEJGYyVYSFuAHoPq9xAUdii3g1ZElWC8UaxfvAKqEQIIpLiQHjXis1kSACTAGnrIxU+b8LE4ioMpqxVg0VwAc0OaUmFRmTI2VT5gsOGAlLPRKIRz0Vrypt2Y2CmDIlGAhAFVZH9XENlBMjIjNSqUYiHk89tcqEYOuEwMkBE0oLxuNkhKw6rwoN8EmcxRdYI67nbra8NXopgAJFSwSEg1ywKAZPzibK5cQAaguAEJLfGXrcGX1BsMSOllXtbY8VZd2oo+M5iPBXMgqEl+vhlKp1JoRLpsNhjKYQLR6CIMNwSDYQEV7KwRLVA99gDlBQ0kAAWbSyKTiGg43jBHJSAC0QOgrGYqDQR6kwVgDXg1+Y8AgArY+gwFBggIOxrxICAAC94H0AAOY9gj4FNXCQABifd0OCWQaBgBoBSQbRxD0F8jA3INcFqHEISoXAOVYYAQIEa8CDoYhviQN0qF4EgsO4eAjEUQd4DUDRilHfQAGY0GMABdIwgA)

* [htm + Async Fetch](https://flems.io/#0=N4IgtglgJlA2CmIBcB2AbAOgCwCYA0IAhgK4AuA9gEryzmFTIBmhsAzvAYxAq8gNqgAdoTCIkIDAAtSYWCAIBjcoNLwVyEAEFWAT0EKABADF4pBZPkh2CBaQjLe4gAxIAjK5ABfPEJFiJAFa8isqq6uIQYAAO5ABOpAbSYAaMseTJAORJGQDcADqCkTHxBsAGYHjl5MQqBp4paZnEYIQQuQUFSoKsCUmwBgC8iTIYAEYQglAAFGAAlPmCnQ4JmuOwEKQ6AMrwhLHmgwZTs4MAfKUFBgYICTEA1vBgyocZURB3hObE7YJXNwaxeCsYiwBJDMrCURIAyCEGwSqENYbCBA6F8AC6dQWlwMXR6BgA5qZVtxkUDDoRdPojicBudgDirqRYjoLr8rhy8QkoIRSIQKQB3VoJRimcxTAAG0lIUVYSAA9PL7rs3hglPLCG95QA3HBK8gPJ6CeUAEmAyqNngls0ZHKuGFIkjUU1iZwBGCCymO8w67LtgOBoIwiNJdnJQx5fODSLDrAwLSiU3IbvI0dDOgwkPgPr9HIDINImb8hwtygWdvqCl5Bym2bZdquePICAw8FiaViUwyAFF23FoQAFA2PZ6Ccgi6qTDAZHMNgFAgtp9axw4Y21XfNBrOHWGwWDljmeHGebHswGkYixX7HN19CW2gA8UAg2tO64MD4mUTI76ZOii8ADKoAAepC-gY2osMQgFmqWghHrmdpRLAnzwJIzZQG2Ax5CAcEwn4OHgcoX5kAMZq1tqtLnHhQzwNqDp7EShaQbA0EIXO8pvohBjvg+oxkBQvzKAo6wKHcZHAExJLLiirCeFxc5XOwezmLx8r8aQgkKQ275mpuhbbgAZIZwyyPe3FXE+L7aYpBh6QuW5+J4GSsAYIYyai4GWSCNm2XZwD6UuZJxgmUz8nSpmwOZfkNg+6ynGahCeA+8rxRyXkcta7F+SlPngSlz6vu+ErZZZ8qFdpEoLCevpPDUpBTFA5AKM0aiFqM5BQDolQ3nSOJ3g+ZrSRs2y7Pskj1Jx5nzJYSjRNwbbILusDeL4ogaGqrDBCAXRhKQGgdV1wAtLEBITEgWBOFEwFuWQ5A5C0wEALQCtAjpIGgACsV3ATk6yCPAT1OhABLSG4GBoDkjChE9rAQAAXvAbgABzXTkSi0LESAAMRYHjORRPQz6CASSBOAYrg-Z4h3dRpgl4CRpDANDKhPcwkCwDoSBGuQrCEwo8CeJY1jwLY9jdBoLiuAAzJ9Xjop4QA)

* [3rd Party Library Integration](https://flems.io/#0=N4IgtglgJlA2CmIBcBWATAOgOwE4A0IAZhAgM7IDaoAdgIZiJIgYAWALmLCAQMYD21NvEHIQAZgBOUAAQAFWhLYBPaQBkIAIwkKVASUHwA5trYQB0gKIAPegAcE3EKXgIepgeSYAGJGKwgAXzwaekZmACtyXgEhESYIMFs+RWkAYRYFNmlCCT4waQBydjZbUiQAenL4UjAMUhZyngzFDEjy2gBXNj4CgG4AHWoEpJTgaTA8cb4OwWkA7Nz8go6wWgg+wcH+alIs9MyAQVtbaQBeaQAKAEozgD5pYEHpaQQspsyB6ifpbd3pKFobFoZ2kFG+zzGSngCiQ0jQXgAjAAWSb8GZsWFoNBzPDgh7SKEwuGIlCo6aCWFiLw4vGQ6ESTGIgBsZPRmIAHDTqM8ALqfb6-LICACy5Ky5wu1D4UHgN1O90e3OeP2a4uk1HgAHc0qrJdL4JNFcrlcpbPBYQUNAoCrilcaAUDYUbjcrYLQNC4yv9AbQMKtbBdctr5dIgxhCRIrraXcqHbRnGwvWC7TGHnjUy93S4LQceABHDoQUgQdw7aQaFQRm3p1Nx2Fxv20ANBu6hviajBowRXGvGgK96Q8mv9lMBK6fY14iTwNgdCTc66t53G94tGW7XJKa4T5Uj54BHffaez+eXOX3C54sAXAo8WjUABu8Zt+KgeVhIrFk12SgQFpY8AQIY7CwkiXheLYVi9AUcw9kq46DAemzUGAYoXG+PArMIbAYBo0pKJMi4hpeSrXgUUAQA+1Ypte+yKEcthwc8NzSIMVwIdQjj8IkJDwBIyDUB0sCwAQziuKWnggD4SI4IEwQgHQDCiJ2pBRCA2yxGwoh4VASjAKsEiGBA1BIGBkHSJ03S9KsVgALSatAbAsEgTIoBBUGwMZ8C2QBQEgQiGBMr0hAxLZxYAF7mgi7KQb0-CwMkSAAMRIqlvS2LQMDGYYSDUgi7kBDpBEaF03TUHgxm2F0wAhYItmEPQJBKEgqFSqQGU8PAASOGJ8BuGYOyiD4CJiCggQ8gEQA)

* [Keyed list](https://flems.io/#0=N4IgtglgJlA2CmIBcB2AbAOgCwCYA0IAZhAgM7IDaoAdgIZiJIgYAWALmLCAQMYD21NvEHIQAaXgBPeFAAEsCKTbcQpeAh5sIA8kwAMSAIx6QAXzw16jZgCtyvAUJFMA9C9nwAHvQAOCWbRQtD5CcoQATnxgsmws8B6ePOoIgrIAygBu6kIxAK5sfOEQtLBIsuxsPqRIbgi04dQYpFmwQhhQ8BkubPmFxbAuANZSMgC08LQ8LKMARrB8PIOkADrUEGA+hWyywLJgeHt8uammshFRsgDkuWC0EJcA3KurCNuxENQA5qSyALyyFFWsh2smgZUMBzoDDKl2Cfngl1k5iBILBsnwsih8BhM1odDoiOR1GBuzRAGZIVYYTx6pE2IS8CjSVAylhKdCrlAjp8WNR8gymaCWbIAKzs7FXeCfT6E1YAXSe1FWhGOmm0xJYeLg8AAwgpFgAKACUOxR7y+P3+5u+TX18ANhiNitMz2o-GoSg8YD4NkUf1NxICPnhMMAPBuAOX3LozA7j8bQw4AZfajKJp4TpMMAfBuAVV3k4GubkeXy2GHAJb7ueBUs+mcAWruXVamRWrd2egAqLA+n39Bo+EDYJt+AD4A8Dm9t4N7ff7xz7FBQe2wMFiFa7geF4D0GrIDbssUj+0ODSjgWADZcfFHZAADAAkwGnvtO-1vWNMl6NKKd9cbbp02wAgsGXb7luKInpcUAQBk5bAnsp4zPkBTUBewBHjBAg8PqgxlJq1DanqECLKh5hXAAStOWRnBA4SetalxGtGMGyKh1qkBgtw+AaBrWvuqHHgabYdgcKGBoxwLDJIZTWhg0AMaJwJYpJ7ZfIuVi8XuwKoe+gZaZ+SrUN6xxsAaXI8DcwgLjMfBQJIBwAT4ukqPwGwkPA4TIHysCwOYlgMKIGA8KQ9ggO6TjKEwlnWcAtzhJ8HxIFgeg+J4AS9A8tyeKMADu0CxEgaAiolngPAo1DwKMcQQDyxaGBgaAPIQjijKQEAAF7YoYAAcSUPPw8zhEgADEWDDQ8PiBBBXxIHosjGElpgRTZ8FsIheAfD4+TAA1gijIQ9AkBJ3rUHwpBjUkpgqGoGhaDoogGIYZIimYcqmEAA)

* [Hacker News + JSX](https://flems.io/#0=N4IgtglgJlA2CmIBcBWAjAOgBxYDQgEMBXAFwHsAleWMgqZAMwNgGd58WBjAJzNlmQBtAAy5hAXXwMICFkNAA7AmERIQGABYkwA-JzIKS8Q8hAAJApwDW8bgAIAcvADucjtXicSEA3LXCkNDQQAF9cRWVVEAArFgAPDFiQPQMjEzUAegy7CABzBTJueDsSDQgWAG4SspYc2oI7BgQwWo1LKxKyO2MCACMEO1i4xsK7AoUAWipLEjtYCF7uAm4IeBYAHQUIMAAHQtngOzA7EMbeY4ByIjACCAuKzecIBSgyZwxprzsAXjtDnngBCMAFFmsYSEgjicKskQGwEF4fAo-CAAgAmFChcIgJQqUyJNwgfSGcGmbZ7bgHI64I5kIiGGlFKBLZwnM5kS7XW73TabYksWYABQAggBxYEAfQAygBJABawJ+djRwgeCn5s14pGKv0OECMYEhCiI-BpOwIuXgRpNsGhvIUWTsLHJA3WIC1Rm4bs2DHpiIMOS2JAodM9AAoPTq-iEAJR-TZ2OwauwGCwsDQAYTaCktSoILAAnuq7GH4AA3OPfAB88YUicTyfNpSVTxebwwNE4QKRmnzGgwLHmnHgYbQMbV9ZyDBLTf7AuWJBYAHV9RowxcMvr4GALjG48AE5Ok75ZtAlbOB0ORwA2ceHyeRjBb46-AjOW6zBjwEicNcAAy0EgdhYJAsgKKB4AmDQlB2CBNFsMgrCIAgdh2DB9DATcDQyAASYBoBCP8Y3vI8MFKYwwwjSsa24AkDDDPc1RIxNW1ed4uF4fgABUyDDUQ7GEO863rU5qDYKcZyBOcSAXZdV3XDJyB2Xd92YuxH3NXNfgAagvQcIGHMMUCEo91NDeAnwNJVjX4CcRO6VhigPYTJ1Y9tO27Axe3TJUNyUjI0B5FyTntB94GZN8GLskImOE1M+yzAgcxHEy7Dc946CgYEy3BAAZco0lsdc2nTX8kstC4aXi9NEuSoSQntZ59RDbVuAjcyhL5E87AzDkVEMJUw3+PrwROaiS0PAAeBcDIGThYHzFhvjdDD+pIN0qxIyadiTBaWCWt0VBkjbgFW8EMCINhuFOU6RsMMjtngCULTIEJJoyHZNoULaWHNOtngUWwzC4gBZXLvlusA1vQ1JwRCKt3t+pKvq2qAIDLXbFuW914B2eY1g2tTIehs7DBYDAbh2SjfxkKBeqh8FqLUxNJvptbjwZwwIZp2A6bukhTgyL7TJjBrgvetGy2Fux3pm+b4C+zr1W6mUrN+IacgNRlvyIbgFB4safhrZyG263XbV+ABCZ8MFeG5njsAB+OwAJIICQLAlxyYLDDemeIFChhzC8Jt83CLsSFQ+4WA7MPIoSF1usw1R9HMf27Hn0J4KWYaDQigYCH48Tnj4d6dpZelyc1OmylZoV5mZdz-OIbDyvTJljQ0CrfCDQekgEDejJO7b0ye+3W2OVuOsADJp4bydJpYG5+G7m27anwel+YWAR6PMX25ljICBR7P622tODvAb8CA2lgiF6SA3fCuxegLP5Q6um6be8FRntyV73qfQbg3SaksL7Y1JouLOB9ExjzAEHNa5NKbU35kzU+plWb8w5mtbm-NBa70nKLEBGRJa71lrXeWbcJbo2lvVWKyYpTXBuNwN+6txom2PMiWYkCuLwDiLMdWz52G8nWj+bqnAlQ20gSwCU+h6QkCYqIouesXZ4U4KcNRPxvi-DQE7OwFxIEXAjvo6RFxCLRVjsJZRSc9RaxyFVBgDA2CzFjEbWsk5kzm0kb3EgBYdg6m0fo-MVgLhqWdq7d2oEMiA1cBgH2HI-ZKHILRDCuE4EXWjoRNSkde7mzsomEi1iJqnxrt4eW4C3R3yhssAs0D26Lz+qvOw2kUyOOcc0uwaBN6NJARoNECMGgyW4JaEg2MJT9CSlYN06lqDYwKPnWwRQvQgDsHneABdgCt3Sd4fu8BB7H3en0ghMsdrzSxoda+dSD7TVWc3YAFwADEWFtwZCMS0m2BFu48L4SQMMQj9k1lfu-XJn9gXjx-k9F6+96kfTIUfChCA26pRipsFF31lZcLsPlAUg1hHCQQKeA0lRDwEtaU478ljTaYq-D+DQgoLRRjDDE+llo8WTmfLUX4NkY4kRpb+MMETgJRPApBaCKE4IaAQkhFCaFUkxJYI7TS8Bvh4WZQywixFT5kUlQoSi3Bxq0ViPRPcaltUUTDFAIEBA2Xtw5UqS1Ml8lHjIG078SoRTimlPKRUAAqEsarcwTE6alUy6UBw8D4LAHifEaSCSdYmWMprpBKH4AWCM4UWTIspTMhOKiNZKpOFVXmNrEwQGnGGAtltAl8CgBgJVcY+V0oZRWhlIbOE4sBvwllUYC0tLQLFMKuak7VzAWc9Obp5gCiuUeOBGx0H1mdsnedC9SHzxnRyimKFKLPhpBANBMCMGMOqSwzW24IbPlOBAc9pwXXktGcAW9zj8FrsIWLF9Z8m7rIho8xSZAdivI6Z2kg3b4YFuAEBkDFd33UKlmuzVB7ITnzHZfGgdBni5A2qhtGOYMC4cAcc6FC8SE0JIlm1F9DurClQritxS6Wb2wUG3YAj5M6n2dpNVW25T1gELuZSy25TjWJ4t+p5-k3lmW1HW9VdghbZIk0YKTuZ2PYtmEq3jkmlXPtPtafgJFoXvQY4rWKYA6SGAtWQTg1xzq9DIFAAsNIqM7HHLCDCsEEDcFMGXXo1AsQRDxGodC+0XOw3SMgXgZADiHgmBMXouRIQPLQJwRLiW7LRf0DQbg8X1nZYYKlmLhQIKZbsLkJYBY8vzAUFYeLWAUA1ccWqN9CgAACNgCwMCWCoWoTAIITAdhw9rHJ3H1j-ZYfUBZISqkPNC8gQ3Ewjc4GNyE-apuovtDZuzQ2GCpAmEwSAsBxtOiSiwCYV0y12TLtYErpmoATHS4USEZZlhhmi7F1Kd2iuPbamlvghR6r2gaBw97D2nvRYq1YP76KGNDb2M6bwBhIRFAWt4HKdkbhxAmE8KApRIRYGEMIHYcRUfLFyM8CbdhiDkFR88KC8A8haCW8INAZYNB2XNDAdDS3twNftB2AqdgawdloNh3IQ35uLYEnZJK2xPIKAmxgAALLUYQ2AuuFHfNwKAXW6CQWeNz9FA4mE1Oh2QWHSIEfUG7Cjw8bPhdk+EJ0ooxw0SO-OwV2w+W3YciWwTp0fAzyfee-ljXtgIebAN8et+NYkZ1g4TD-UZvye9BYHwbUdkEAMAhBL1b+vIFDZs8H7gEwlLe+GMn+YUA7AB5e27-VRPhmk86Vx+3zfWeZQ54344zes-CS24YE7EAABeVpOny4J3rsPueBdFDxqsWose285jtwJDvDXYTwk8HD5Eph5doiQAAZgAJyhHECEIAA)

* [Router example with navaid](https://flems.io/#0=N4IgtglgJlA2CmIBcB2AjAOgBwoDQgDMIEBnZAbVADsBDMRJEDACwBcxYR8BjAeytbwByEAGFeAVwHwATlxAl4Cbqwj8yjAAyoQAX1zU6DJgCsyPfoOGMIYAA68ZrAATBnYXO8kDPM+FBkaAHdnXWcCGV4wZwByCTAaCBiAbgAdKlsHJ2daADdEqHDI6Ji8goABTAAmDE0U9PSEFwASOxoAc3g0qj4qEhdIiUEZZwBeHJp86AAKAEpu3v7nGSkABQ74Medp7ntPO0i7Ei3gXVmxgD5XdOdnVo2tucv3Hb3nA94j+Zvl-0CgubdXTddKLFwAQTsdke51GV2mPzA0xiCQgVBiniR906s1m6W+VFB6hcAAkoptxk84dtEcioBBchifrckTFmGgMbFmOT3hsYrNcMyXjEaJy3Mw-AQkLEAPQSRQyGUAa3guTRMVCnhi7V4zlYupVavReKotxNBKJfRcAFUFY83NBQrD4bSYvTGYLTbdhezOQADZrAaC6GLHD5EBB+gVC1mizziyXSmIyjX6WI65wAIxo3CVzm59H5P3NIKoMplznBrFYOeYy0kghI6UGwx+GH4yJTnipV2AQpWVHWnWmZPoJtuZzbHeT8tkMqQ0E50wdhTOzz7XtuA6H8Gmttk8ecjrO3QnBNuzYbsgwsAg-SEgPSYG8rGmUF43HiQlYGEzvCgACeniQnY8zyHw9jELIyBUBIsCwPohj0CIGDcCQ5ggL0VisCIf6AcACQyO0aJIAALJodgAB7ODQQy8MkCSUQAtEE0CsMwSAAGwAKwUZRyS3lQ8BMcw8AQO0bBIJgnHJAQlhMSQEAAF7wFJWBUckfCwI4SAAMSkQZyRtDAaLtEgmjOGgfG6HhQGZkM+pULgaJ2EMwByQITEEHQxAAUgz5ULwJBtNw8C6PIijKKo6giNoaAAMzcXoAC6uhAA)

## Credits

`umai` is a hard fork of [hyperapp](https://github.com/jorgebucaran/hyperapp). Credit goes to all Hyperapp maintainers.

`umai` is heavily inspired by [Mithril.js](https://github.com/MithrilJS/mithril.js).
