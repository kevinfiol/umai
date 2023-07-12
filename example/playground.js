import { m, mount, memo } from '../index.js';

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

export function runApp() {
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

  let on = true;
  let calls = 0;
  let names = ['a', 'b', 'b', 'c'];
  let current = 0;

  // const Foo = ({ name }, oldProps) => {
  //   if (name === oldProps.name)
  //     return m.retain();

  //   calls += 1;
  //   console.log(calls);
  //   return m('div',
  //     m('p', name)
  //   )
  // };

  // const Foo = memo(() => {
  //   console.log('mount FOo!!');
  //   return ({ name }) => {
  //     calls += 1;
  //     console.log(calls);
  //     return m('div',
  //       m('p', name)
  //     )
  //   };
  // });

  // const App = () => (
  //   m('div',
  //     m('button', { id: 'next', onclick: () => current += 1 }, 'next'),
  //     m(Foo, { name: names[current] })
  //   )
  // );

  const Fuz = () => (
    m('div.cool', {
      remove: (node) => {
        console.log('about to return promise...', node);
        node.classList.add('exit');
        return new Promise(res =>
          node.addEventListener('animationend', () => {
            console.log('remove fuz');
            res();
          })
        );
      }
    }, 'sup')
  );

  const FancyComponent = () => {
    const onMount = (node) => {
      console.log('onMount');
    }

    const onRemove = (node) => {
      node.classList.add('exit');
      return new Promise(res => {
        node.addEventListener('animationend', () => {
          console.log('remove');
          res();
        });
      });
    };

    return () => m('div.fancy', {
      dom: onMount,
      remove: onRemove
    }, 'hello world', m(Fuz));
  };

  const App = () => (
    m('div',
      m('button', { onclick: () => on = !on }, 'toggle'),
      on ? m(FancyComponent) : null
    )
  );

  mount(root, App);
}
