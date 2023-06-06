// import { m, mount } from '../index.js';
// import { m, umount as mount } from './closures.js';
// import { h, app, text } from './hyperapp.js';

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
    h('div', {}, [
      h('h2', {}, text(`Counter: ${count}`)),
      h('button', { onclick: Increment }, text('increment'))
    ])
  );

  const App = ({ count, input, filtered }) => (
    h("div", { class: 'monospace' }, [
      h('h1', { class: 'sans-serif' }, text('hello')),
      input !== 'r' && 
        h('p', {}, text('remove me')),
      ,
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

  // debug(App(initialState));
}

export function runUmaiApp() {
  let value = '';
  let count = 0;
  let filtered = [...xs];

  const SubCounter = ({ count, name, onClick }) => (
    m('div.counter',
      m('h2', count),
      m('button', { onclick: onClick }, 'inc'),
      m('p', name)
    )
  );

  const StatefulSubCounter = ({ onClick }) => {
    let statefulCount = 1;

    return ({ count, name }) => (
      m('div.counter',
        m('h2', count),
        m('h3', `stateful count: ${statefulCount}`),
        m('button', { onclick: onClick }, 'inc'),
        m('button', { onclick: () => statefulCount += 1 }, 'inc stateful'),
        m('p', name)
      )
    );
  };

  const PureCounter = () => (
    m('div.counter',
      m('h2', count),
      m('button', { onclick: () => count += 1 }, 'inc')
    )
  );

  const Counter = () => {
    let count = 14;

    return (props) => (
      m(StatefulSubCounter, {
        count,
        name: props.name,
        onClick: () => count += 1
      })
      // m('div.counter',
      //   m('h2', count),
      //   m('button', { onclick: () => count += 1 }, 'inc'),
      //   m('p', props.name)
      // )
    )
  };

  const App = () => (
    m('div.monospace',
      // m('h1', { class: 'sans-serif' }, 'sup'),

      // value !== 'r' &&
      //   m('p', 'remove me')
      // ,

      m('input', { value, oninput: (ev) => {
        value = ev.target.value;
        filtered = xs.filter(x => x.name.indexOf(value) > -1)
      } }),

      m('ul',
        filtered.map(x =>
          // m('p', { key: x.name }, x.name)
          m(Counter, { key: x.name, name: x.name })
        )
      )
    )
  );

  mount(root, App);
}

export function runMithrilApp() {
  let value = '';
  let count = 0;
  let filtered = [...xs];

  const StatefulSubCounter = ({ attrs: { onClick } }) => {
    let statefulCount = 1;

    return {
      view: ({ attrs: { count, name } }) => (
        m('div.counter',
          m('h2', count),
          m('h3', `stateful count: ${statefulCount}`),
          m('button', { onclick: onClick }, 'inc'),
          m('button', { onclick: () => statefulCount += 1 }, 'inc stateful'),
          m('p', name)
        )
      )
    };
  }

  const Counter = () => {
    let count = 14;

    return {
      view: ({ attrs }) => (
        m(StatefulSubCounter, {
          count,
          name: attrs.name,
          onClick: () => count += 1
        })
      )
    };
  };

  const App = () => (
    m('div.monospace',
      m('input', { value, oninput: (ev) => {
        value = ev.target.value;
        filtered = xs.filter(x => x.name.indexOf(value) > -1)
      } }),

      m('ul',
        filtered.map(x =>
          // m('p', { key: x.name }, x.name)
          m(Counter, { key: x.name, name: x.name })
        )
      )
    )
  );

  m.mount(root, { view: App })
}

function debug(tree) {
  document.getElementById('vnode').innerHTML += `<pre>${JSON.stringify(tree, null, 2)}</pre>`;
}