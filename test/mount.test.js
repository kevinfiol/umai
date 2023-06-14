import { strict as assert } from 'node:assert';
import { suite } from 'flitch';
import * as env from './env.js';
import { m, mount, reset } from '../index.js';

const test = suite.only('mount');

function setup(view) {
  // setup or reset jsdom
  env.setup();
  // reset umai redraws
  reset();

  const root = document.getElementById('app');
  const redraw = mount(root, view);
  return { root, redraw, html: root.innerHTML };
}

test('mount app', () => {
  const App = () => m('p', 'hi');
  const { html } = setup(App);
  assert.equal(html,
    '<p>hi</p>'
  );
});

test('mounting nested elements', () => {
  const App = () => (
    m('div',
      m('p', 'hi')
    )
  );

  const { html } = setup(App);
  assert.equal(html,
    '<div><p>hi</p></div>'
  );
});

test('events', () => {
  let count = 0;
  const App = () => (
    m('div',
      m('p', count),
      m('button', { id: 'add', onclick: () => count += 1 }, 'increment')
    )
  );

  const { root } = setup(App);
  assert.equal(root.innerHTML,
    '<div><p>0</p><button id="add">increment</button></div>'
  );

  const button = document.getElementById('add');
  env.fire(button, 'click');

  assert.equal(root.innerHTML,
    '<div><p>1</p><button id="add">increment</button></div>'
  );
});