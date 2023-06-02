import { m, mount } from '../index.js';
import { h, app, text } from './hyperapp.js';

const root = document.getElementById('app');

const xs = [
  { id: 1, name: 'aaab' },
  { id: 2, name: 'aab' },
  { id: 3, name: 'aabb' },
  { id: 4, name: 'abbb' },
  { id: 5, name: 'bbba' },
  { id: 6, name: 'bbaa' },
  { id: 7, name: 'baaa' },
];

export function runHyperApp() {
  const Increment = (state) => ({
    ...state,
    count: state.count + 1
  });

  const FilterResults = (state, event) => ({
    ...state,
    input: event.target.value,
    filtered: state.list.filter(x => x.name.indexOf(event.target.value) > -1)
  });

  const Counter = ({ count }) => (
    h('span', {}, [
      h('h2', {}, text(`Counter: ${count}`)),
      h('button', { onclick: Increment }, text('increment'))
    ])
  );

  const App = ({ input, filtered }) => (
    h("div", { class: 'monospace' }, [
      h('h1', { class: 'sans-serif' }, text('hello')),
      // Counter({ count })
      h('input', { type: 'text', value: input, oninput: FilterResults }),
      h('div', {},
        filtered.map(person =>
          h('div', { key: person.id }, text(person.name))
        )
      )
    ])
  );

  const initialState = { count: 0, list: xs, filtered: xs, input: '' };

  app({
    init: initialState,
    view: App,
    node: document.getElementById('app')
  });

  debug(App(initialState));
}

export function runUmaiApp() {
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

  const Counter = () => (
    m(SubCounter)
  );

  // const Counter = () => {
  //   let count = 0;

  //   return () => (
  //     m('div.counter',
  //       m('h2', count),
  //       m('button', { onclick: () => count += 1 }, 'inc')
  //     )
  //   )
  // }

  // const App = () => (
  //   m('div.monospace',
  //     m('h1', { class: 'sans-serif' }, 'hello'),
  //     m('p',
  //       m('span', 'in the p')
  //     )
  //     // m(Counter)
  //   )
  // );

  const Button = () => (
    m('button', { onclick: () => count += 1 }, 'inc')
  );

  const App = () => (
    m('div.monospace',
      m('h1', { class: 'sans-serif' }, 'sup'),
      m('p',
        m('span', count),
        count % 2 === 0 &&
          m('p', 'should disappear')
        ,
        m(Button)
      )
    )
  );

  mount(root, App);
  debug(App());
}

function debug(tree) {
  document.getElementById('vnode').innerHTML += `<pre>${JSON.stringify(tree, null, 2)}</pre>`;
}