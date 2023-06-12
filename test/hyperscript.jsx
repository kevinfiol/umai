import { suite } from 'flitch';
import { strict as assert } from 'node:assert';
import { m } from '../index.js';

const test = suite('hyperscript jsx');

const COMPONENT = 2;
const ELEMENT = 1;
const TEXT = 3;
const FRAGMENT = 5

test('simple elements', () => {
  assert.deepEqual(
    <div>test</div>,
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
    <div class="one two three"></div>,
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: { class: 'one two three' },
      children: []
    }
  );
});

test('class builder', () => {
  assert.deepEqual(
    <div class={{ one: true, two: false, three: true }} />,
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
    <div one={2} />,
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
    <div>
      <p>one</p>
    </div>,
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
    <Comp one={2}>
      <p>child</p>
    </Comp>,
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

test('fragments', () => {
  assert.deepEqual(
    <div>
      <>
        <b>hi</b>
      </>
    </div>,
    {
      tag: 'div',
      type: ELEMENT,
      key: undefined,
      props: {},
      children: [
        {
          tag: '[',
          type: FRAGMENT,
          key: undefined,
          props: {},
          children: [
            {
              tag: 'b',
              type: ELEMENT,
              props: {},
              key: undefined,
              children: [
                { tag: 'hi', type: TEXT }
              ]
            }
          ]
        }
      ]
    }
  );
})