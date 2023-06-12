import { JSDOM } from 'jsdom';

const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');

export function setup() {
  global.window = window;
  global.document = window.document;
}

export function reset() {
  window.document.body.innerHTML = '<div id="app"></div>';
}

export function fire(elem, event, details) {
  let evt = new window.Event(event, details);
  elem.dispatchEvent(evt);
}
