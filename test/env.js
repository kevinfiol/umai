import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><body></body></html>');
let init = false;

export function setup() {
  if (!init) {
    global.window = window;
    global.document = window.document;
    global.requestAnimationFrame = x => x();
    init = true;
  };

  reset();
}

export function reset() {
  window.document.body.innerHTML = '<div id="app"></div>';
}

export function fire(elem, event, details) {
  let evt = new window.Event(event, details);
  elem.dispatchEvent(evt);
}
