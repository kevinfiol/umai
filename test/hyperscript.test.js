import { suite } from 'flitch';
import { strict as assert } from 'node:assert';
import { m } from '../index.js';

const test = suite('hyperscript');

const COMPONENT = 2;
const ELEMENT = 1;
const TEXT = 3;

test('simple elements', () => {
  assert.deepEqual(
    m('div', 'test'),
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: {},
      children: [
        { type: TEXT, tag: 'test' }
      ]
    }
  );
});

test('class strings', () => {
  assert.deepEqual(
    m('div.one.two.three'),
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: { class: 'one two three' },
      children: []
    }
  );

  assert.deepEqual(
    m('div.one.two.three', { class: 'four' }),
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: { class: 'one two three four' },
      children: []
    }
  );
});

test('class builder', () => {
  assert.deepEqual(
    m('div', { class: { one: true, two: false, three: true } }),
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: { class: 'one three' },
      children: []
    }
  );
});

test('props', () => {
  assert.deepEqual(
    m('div', { one: 2 }),
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: { one: 2 },
      children: []
    }
  );
});

test('element children', () => {
  assert.deepEqual(
    m('div',
      m('p', 'one')
    ),
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: {},
      children: [
        {
          tag: 'p',
          type: ELEMENT,
          key: undefined,
          props: {},
          children: [
            { type: TEXT, tag: 'one' }
          ]
        }
      ]
    }
  )
})

test('component types', () => {
  const Comp = () => m('p', 'sup');

  assert.deepEqual(
    m(Comp, { one: 2 }, m('p', 'child')),
    {
      tag: Comp,
      type: COMPONENT,
      key: undefined,
      props: { one: 2 },
      children: [
        {
          tag: 'p',
          type: ELEMENT,
          key: undefined,
          props: {},
          children: [
            { type: TEXT, tag: 'child' }
          ]
        }
      ]
    }
  )
});

test('array children', () => {
  assert.deepEqual(
    m('div', [
      m('p', 'hello')
    ]),
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: {},
      children: [
        {
          tag: 'p',
          type: ELEMENT,
          key: undefined,
          props: {},
          children: [
            { type: TEXT, tag: 'hello' }
          ]
        }
      ]
    }
  );
})