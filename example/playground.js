import { m, mount } from '../index.js';

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

export function runUmaiApp() {
  let count = 0;

  const One = () => [
    count === 0 &&
      m('p', 'one')
    ,
    m('p', 'two')
  ];

  const App = () => (
    m('div',
      count === 0 &&
        m('p', 'spinner')
      ,

      m('h1', count),
      m(One),
      m('button', { id: 'add', onclick: () => count += 1 }, 'inc')
    )
  );

  mount(root, App);
}
