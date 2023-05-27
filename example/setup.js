let idCounter = 1;

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"],
  colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"],
  nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

function _random (max) { return Math.round(Math.random() * 1000) % max; };

class Store {
  constructor(initial) {
    this.value = initial;
  }

  get() {
    return this.value;
  }

  set(value) {
    this.value = value;
  }
}

export function buildData(count) {
  let data = new Array(count);
  for (let i = 0; i < count; i++) {
    const label = new Store(`${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`);

    data[i] = {
      id: idCounter++,
      label
    }
  }
  return data;
}