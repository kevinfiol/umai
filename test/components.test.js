import { strict as assert } from 'node:assert';
import { suite } from 'flitch';
import * as env from './env.js';
import { m, mount, reset, memo } from '../index.js';

const test = suite('components');

const stripHtml = html => html.replace(/>(\s|\n)*</g, '><').trim();
const assertHtml = (a, b) => assert.equal(stripHtml(a), stripHtml(b));

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

test('using innerHTML', () => {
  const App = () => m('p', { innerHTML: '<strong>hello world</strong>' });
  const { html } = setup(App);
  assert.equal(html,
    '<p><strong>hello world</strong></p>'
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

test('style builder', () => {
  const App = () => (
    m('div', { style: 'background-color:green' }, 'hello')
  );

  const { html } = setup(App);
  assert.equal(html,
    '<div style="background-color:green">hello</div>'
  );
});

test('style builder w/ objects', () => {
  const App = () => (
    m('div', { style: { backgroundColor: 'green', border: '1px solid red' } }, 'hello')
  );

  const { html } = setup(App);
  assert.equal(html,
    '<div style="background-color:green;border:1px solid red">hello</div>'
  );
});

test('style builder w/ empty object', () => {
  const App = () => (
    m('div', { style: {} }, 'hello')
  );

  const { html } = setup(App);
  assert.equal(html,
    '<div>hello</div>'
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
  `);

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
  `);
});

test('non-component fragments', () => {
  const One = () => [
    m('p', 'one'),
    m('p', 'two')
  ];

  const App = () => (
    m('div',
      m('div',
        One(),
        m('p', 'three')
      )
    )
  );

  const { html } = setup(App);
  assertHtml(html, `
    <div>
      <div>
        <p>one</p>
        <p>two</p>
        <p>three</p>
      </div>
    </div>
  `);
});

test('fragments with null/undefined/false children', () => {
  let count = 0;

  const One = () => [
    count === 0 &&
      m('p', 'one')
    ,
    m('p', 'two')
  ];

  const Nested = () => [,
    [
      One()
    ]
  ];

  const App = () => (
    m('div',
      count === 0 &&
        m('p', 'spinner')
      ,

      m('h1', count),
      Nested(),
      m('button', { id: 'add', onclick: () => count += 1 }, 'inc')
    )
  );

  const { root } = setup(App);

  assertHtml(root.innerHTML, `
    <div>
      <p>spinner</p>
      <h1>0</h1>
      <p>one</p>
      <p>two</p>
      <button id="add">inc</button>
    </div>
  `);

  const btn = document.getElementById('add');
  env.fire(btn, 'click');

  assertHtml(root.innerHTML, `
    <div>
      <h1>1</h1>
      <p>two</p>
      <button id="add">inc</button>
    </div>
  `);
});

test('component children', () => {
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
  );

  const { html } = setup(App);
  assertHtml(html, `
    <main>
      <div class="layout">
        <p>kevin</p>
        <p>raf</p>
        <p>brett</p>
      </div>
    </main>
  `);
});

test('remove calls', () => {
  let flag = true;
  let calls = [];

  const Comp = () => {
    return () => (
      m('div', {
        dom: () => {
          return () => calls.push('1');
        }
      }, 'comp')
    )
  };

  const Nested = () => {
    return () => (
      m('section', {
        dom: () => {
          return () => calls.push('2')
        }
      },
        m(Comp)
      )
    );
  };

  const App = () => (
    m('main',
      m('h1', 'head'),
      flag && m(Nested),
      m('button', { id: 'switch', onclick: () => flag = false }, 'switch')
    )
  );

  const { root } = setup(App);

  assertHtml(root.innerHTML, `
    <main>
      <h1>head</h1>
      <section>
        <div>comp</div>
      </section>
      <button id="switch">switch</button>
    </main>
  `);

  assert.deepEqual(calls, []);

  const btn = document.getElementById('switch');
  env.fire(btn, 'click');

  assertHtml(root.innerHTML, `
    <main>
      <h1>head</h1>
      <button id="switch">switch</button>
    </main>
  `);

  // ensure correct removal order
  assert.deepEqual(calls, ['1', '2']);
});

test('memoization', () => {
  let calls = 0;
  let names = ['a', 'b', 'b', 'c'];
  let current = 0;

  const Foo = memo(({ name }) => {
    calls += 1;
    return m('div',
      m('p', name)
    )
  });

  const App = () => (
    m('div',
      m('button', { id: 'next', onclick: () => current += 1 }, 'next'),
      m(Foo, { name: names[current] })
    )
  );

  const { html } = setup(App);
  const button = document.getElementById('next');

  assertHtml(html, `
    <div>
      <button id="next">next</button>
      <div>
        <p>a</p>
      </div>
    </div>
  `);

  assert.equal(calls, 1); // a, first render
  env.fire(button, 'click');
  assert.equal(calls, 2); // b
  env.fire(button, 'click');
  assert.equal(calls, 2); // we passed b again, so do not rerender
  env.fire(button, 'click');
  assert.equal(calls, 3); // c
});

test('manual memoization', () => {
  let calls = 0;
  let names = ['a', 'b', 'b', 'c'];
  let current = 0;

  const Foo = ({ name }, oldProps) => {
    if (name === oldProps.name)
      return m.retain();

    calls += 1;
    return m('div',
      m('p', name)
    );
  };

  const App = () => (
    m('div',
      m('button', { id: 'next', onclick: () => current += 1 }, 'next'),
      m(Foo, { name: names[current] })
    )
  );

  const { html } = setup(App);
  const button = document.getElementById('next');

  assertHtml(html, `
    <div>
      <button id="next">next</button>
      <div>
        <p>a</p>
      </div>
    </div>
  `);

  assert.equal(calls, 1); // a, first render
  env.fire(button, 'click');
  assert.equal(calls, 2); // b
  env.fire(button, 'click');
  assert.equal(calls, 2); // we passed b again, so do not rerender
  env.fire(button, 'click');
  assert.equal(calls, 3); // c
});

test('memoize stateful component', () => {
  let calls = 0;
  let names = ['a', 'b', 'b', 'c'];
  let current = 0;

  const Foo = memo(() => {
    return ({ name }) => {
      calls += 1;
      return m('div',
        m('p', name)
      )
    };
  });

  const App = () => (
    m('div',
      m('button', { id: 'next', onclick: () => current += 1 }, 'next'),
      m(Foo, { name: names[current] })
    )
  );

  const { html } = setup(App);
  const button = document.getElementById('next');

  assertHtml(html, `
    <div>
      <button id="next">next</button>
      <div>
        <p>a</p>
      </div>
    </div>
  `);

  assert.equal(calls, 1); // a, first render
  env.fire(button, 'click');
  assert.equal(calls, 2); // b
  env.fire(button, 'click');
  assert.equal(calls, 2); // we passed b again, so do not rerender
  env.fire(button, 'click');
  assert.equal(calls, 3); // c
});

test('cleanup functions should not throw', () => {
  let watch = 0;

  function Counter() {
    function onMount() {
      watch = 1;
  
      return () => {
        watch = 2;
      };
    }
  
    return () => m('div', { dom: onMount }, 'counter');
  }
  
  function Container() {
    let show = false;
    const toggle = () => show = !show;
  
    return () => (
      m('div',
        m('button', { id: 'toggle', onclick: toggle }, 'toggle'),
        show && m(Counter)
      )
    );
  }

  const App = () => m(Container);
  const { root } = setup(App);

  assert.equal(watch, 0);
  assertHtml(root.innerHTML, `
    <div>
      <button id="toggle">toggle</button>
    </div>
  `);

  const button = document.getElementById('toggle');
  env.fire(button, 'click');

  assert.equal(watch, 1);
  assertHtml(root.innerHTML, `
    <div>
      <button id="toggle">toggle</button>
      <div>counter</div>
    </div>
  `);

  env.fire(button, 'click');

  assert.equal(watch, 2);
  assertHtml(root.innerHTML, `
    <div>
      <button id="toggle">toggle</button>
    </div>
  `);
});