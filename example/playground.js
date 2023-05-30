import { m, render, mount } from '../index.js';

// function App() {
//   return (
//     m('div.monospace',
//       m('h1', 'A simple app'),
//       m(Counter, { initialCount: 0 }),
//       m(Counter, { initialCount: 10 })
//     )
//   );
// }

// // simple components
// function Double({ count }) {
//   return m('h2', count * 2);
// }

// // stateful components
// function Counter({ initialCount }) {
//   let count = initialCount;

//   return () => [
//     m('h2', count),
//     m('h3', 'doubled:'),
//     m(Double, { count }),
    
//     count % 4 === 0 &&
//       m('p', 'divisible by 4')
//     ,
    
//     m('button', { onclick: () => count += 1 }, 'increment')
//   ];
// }

let count = 0;

const Third = (_, children) => (
  m('span',
    m('h2', 'Counter: ', count),
    m('button', { onclick: () => count += 1 }, 'increment'),
    children
  )
)

const SubCounter = () => (
  m(Third, m('h3', 'an h3'))
)

// const Counter = () => (
//   m(SubCounter)
// );

const Counter = () => {
  let count = 0;

  return () => (
    m('div.counter',
      m('h2', count),
      m('button', { onclick: () => count += 1 }, 'inc')
    )
  )
}

const App = () => (
  m('div.monospace',
    m('h1', { class: 'sans-serif' }, 'hello'),
    m(Counter)
  )
);

export function runApp() {
  const root = document.getElementById('app');
  // mount(document.getElementById('app'), App);

  mount(root,
    App
  );
  // debug(App());
}

function debug(tree) {
  document.getElementById('vnode').innerHTML += `<pre>${JSON.stringify(tree, null, 2)}</pre>`;
}