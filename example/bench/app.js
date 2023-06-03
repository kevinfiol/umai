import { mount, m, redraw } from '../../index.js';
import { buildData } from './setup.js';

// state
let data = [];
let selected = null;

const run = () => data = buildData(1000);
const runLots = () => data = buildData(10000);
const add = () => data = data.concat(buildData(1000));
const update = () => {
  for (let i = 0, len = data.length; i < len; i += 10) {
    data[i].label.set(data[i].label.get() + ' !!!');
  }
}

const swapRows = () => {
  const d = data.slice();
  if (d.length > 998) {
    let tmp = d[1];
    d[1] = d[998];
    d[998] = tmp;
    data = d;
  }
};

const clear = () => data = [];

const remove = id => {
  const idx = data.findIndex(d => d.id === id);
  data = [...data.slice(0, idx), ...data.slice(idx + 1)];
};

const App = () => (
  m('div',
    m('button', { onclick: run }, 'Create 1,000 rows'),
    m('button', { onclick: runLots }, 'Create 10,000 rows'),
    m('button', { onclick: add }, 'Append 1,000 rows'),
    m('button', { onclick: update }, 'Update every 10th row'),
    m('button', { onclick: clear }, 'Clear'),
    m('button', { onclick: swapRows }, 'Swap Rows'),

    m('table',
      data.map((row) =>
        m('tr', { key: row.id, style: selected === row.id ? 'background-color:red;' : '' },
          m('td', row.id),
          m('td', m('button', { onclick: () => selected = row.id }, row.label.get())),
          m('td', m('button', { onclick: () => remove(row.id) }, 'remove'))
        )
      )
    )
  )
);

export function runApp() {
  mount(document.getElementById('app'), App);
}
