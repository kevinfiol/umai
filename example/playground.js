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
  const State = () => ({ count: 0 });
  const Actions = state => ({ inc: () => { state.count += 1; console.log('updated state.count', state.count); } });

  const Home = () => {
    return ({ state, actions }) => {
      console.log('render Home', state.count);
      return m('div',
        m('p', 'here is the count: ', state.count),
        m('button', { onclick: actions.inc }, 'increment')
      );
    };
  };

  const App = ({ state, actions }) => (
    m('main',
      m('h1', 'here is the main app', state.count),
      m(Home, { state, actions })
    )
  );

  const state = State();
  const actions = Actions(state);

  mount(root, () => {
    return m(App, { state, actions });
  });
}
