import { strict as assert } from 'node:assert';
import { suite } from 'flitch';
import beautify from 'simply-beautiful';
import * as env from './env.js';
import { m, mount, reset } from '../index.js';

const test = suite('mount');

function setup(view) {
  // setup or reset jsdom
  env.setup();
  // reset umai redraws
  reset();

  const root = document.getElementById('app');
  const redraw = mount(root, view);
  return { root, redraw, html: root.innerHTML };
}

const assertHtml = (a, b) => assert.equal(beautify.html(a), beautify.html(b));

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

test('state update onclick', () => {
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

  env.fire(button, 'click');
  assert.equal(root.innerHTML,
    '<div><p>2</p><button id="add">increment</button></div>'
  );
});

test('components', () => {
  const One = () => (
    m('p', 'one')
  );

  const App = () => (
    m('div',
      m(One),
      m('p', 'two')
    )
  );

  const { html } = setup(App);
  assert.equal(html,
    '<div><p>one</p><p>two</p></div>'
  );
});

test('components with props', () => {
  let num = 1;

  const One = ({ count }) => (
    m('p', count)
  );

  const App = () => (
    m('div',
      m(One, { count: num }),
      m('p', 'two')
    )
  );

  const { html } = setup(App);
  assert.equal(html,
    '<div><p>1</p><p>two</p></div>'
  );
});

test('stateful component', () => {
  const One = () => {
    let foo = 'bar';
    return () => m('p', foo);
  };

  const App = () => (
    m('div',
      m(One),
      m('p', 'two')
    )
  );

  const { html } = setup(App);
  assert.equal(html,
    '<div><p>bar</p><p>two</p></div>'
  );
});

test('stateful component with props', () => {
  let name = 'kevin';

  const One = (initial) => {
    let foo = 'bar';
    return ({ title }) => m('p', `${foo} ${title} ${initial.title}`);
  };

  const App = () => (
    m('div',
      m(One, { title: name }),
      m('p', 'two')
    )
  );

  const { root, redraw } = setup(App);
  assert.equal(root.innerHTML,
    '<div><p>bar kevin kevin</p><p>two</p></div>'
  );

  name = 'rafael';
  redraw();
  assert.equal(root.innerHTML,
    '<div><p>bar rafael kevin</p><p>two</p></div>'
  );
});

test('null/false/undefined children', () => {
  const One = () => {
    let count = 0;
    return () => m('div',
      count === 0 &&
        m('p', 'one')
      ,

      m('p', count),
      m('button', { id: 'add', onclick: () => count += 1 }, 'inc')
    )
  };

  const App = () => (
    m('div',
      m(One),
      m('p', 'three')
    )
  );

  const { root } = setup(App);
  assertHtml(root.innerHTML, `
    <div>
      <div>
        <p>one</p>
        <p>0</p>
        <button id="add">inc</button>
      </div>
      <p>three</p>
    </div>
  `)

  const btn = document.getElementById('add');
  env.fire(btn, 'click');

  assertHtml(root.innerHTML, `
    <div>
      <div>
        <p>1</p>
        <button id="add">inc</button>
      </div>
      <p>three</p>
    </div>
  `)
});