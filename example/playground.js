import { m, mount } from '../index.js';

const root = document.getElementById('app');

const xs = [
  { count: 0, name: 'aaab' },
  { count: 0, name: 'aab' },
  { count: 0, name: 'aabb' },
  { count: 0, name: 'abbb' },
  { count: 0, name: 'bbba' },
  { count: 0, name: 'bbaa' },
  { count: 0, name: 'baaa' },
];

export function runUmaiApp() {
  // let input = '';
  // let filtered = [...xs];

  // const App = () => (
  //   m('div',
  //     m('table',
  //       xs.map(x =>
  //         m('tr',
  //           m('td', x.count),
  //           m('td', x.name)
  //         )
  //       )
  //     ),

  //     m('input', {
  //       value: input,
  //       oninput: ev => {
  //         input = ev.target.value;
  //         filtered = xs.filter(x => x.name.indexOf(input) > -1);
  //       }
  //     }),

  //     filtered.map(x =>
  //       m('div', { key: x.name },
  //         m('p', x.name),
  //         m('button', { onclick: () => x.count += 1 }, 'add')
  //       )
  //     )
  //   )
  // )

  let count = 0;

  const One = () => [
    count === 0 &&
      m('p', 'one')
    ,
    m('p', 'two')
  ];

  const Nested = () => m('[',
    m('[',
      m(One)
    )
  )

  const App = () => (
    m('div',
      count === 0 &&
        m('p', 'spinner')
      ,

      m('h1', count),
      m(Nested),
      m('button', { id: 'add', onclick: () => count += 1 }, 'inc')
    )
  );

  mount(root, App);
}
