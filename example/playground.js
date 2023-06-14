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

  const Layout = ({ children }) => (
    m('div.layout',
      children
    )
  );

  const Person = ({ name }) => (
    m('p', name)
  );

  const App = () => (
    m('main',
      m(Layout,
        m(Person, { name: 'kevin' }),
        m(Person, { name: 'raf' }),
        m(Person, { name: 'brett' }),
      )
    )
  )

  mount(root, App);
}
