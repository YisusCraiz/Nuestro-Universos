'use strict';

let liveLanguageDetector;
const liveChatLinks = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const liveChatShortWords = new Map([
  ['hola','es'], ['adiós','es'], ['espera','es'], ['ven','es'],
  ['hi','en'], ['hello','en'], ['bye','en'], ['thanks','en'], ['yes','en']
]);

async function liveChatSource(text, handle) {
  const short = text.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  if (liveChatShortWords.has(short)) return liveChatShortWords.get(short);
  try {
    liveLanguageDetector ??= import('./assets/tinyld-light-1.3.4.js');
    const {detect} = await liveLanguageDetector;
    const guess = detect(text, {only:['es','en']});
    if (guess) return guess;
  } catch {
    // A profile's usual language is sufficient for ambiguous messages and offline detection.
  }
  return handle === 'julisa' ? 'en' : 'es';
}

async function translateLiveMessage(message, target, active) {
  const parts = message.body.split(liveChatLinks);
  const plain = parts.filter((_, index) => index % 2 === 0).join(' ');
  if (!/\p{L}/u.test(plain)) return message.body;
  const source = await liveChatSource(plain, message.handle);
  if (source === target || !active()) return message.body;

  for (let index = 0; index < parts.length; index += 2) {
    if (!active()) return message.body;
    if (/\p{L}/u.test(parts[index])) parts[index] = await freeTranslate(parts[index], source, target);
  }
  return parts.join('');
}

function liveTranslationPreference() {
  try {
    return localStorage.getItem('jj-live-translate') !== 'off';
  } catch {
    return true;
  }
}

function mountLiveTranslation(log, enabled, valid) {
  let translations = new Map();
  const originals = new Set();
  const nodes = new WeakMap();
  const queue = [];
  let running = 0;
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      nodes.get(target)?.();
    }
  }, {root:log}) : null;

  function drain() {
    while (running < 2 && queue.length) {
      const {run, resolve} = queue.shift();
      running++;
      run().then(resolve, () => resolve(null)).finally(() => {
        running--;
        drain();
      });
    }
  }

  function decorate(item, message) {
    const text = document.createElement('p');
    text.setAttribute('translate', 'no');
    text.textContent = message.body;
    item.append(text);
    if (!enabled()) return;

    const target = UniverseI18n.language;
    const cache = translations;
    const key = message.id + ':' + target;
    const active = () => cache === translations && valid() && enabled() && UniverseI18n.language === target;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stream-chat-translation-action';
    button.hidden = true;
    item.append(button);

    async function translate() {
      if (!active()) return;
      if (!cache.has(key)) {
        cache.set(key, new Promise(resolve => queue.push({
          resolve,
          run:() => active() ? translateLiveMessage(message, target, active) : Promise.resolve(null)
        })));
        drain();
      }
      const result = await cache.get(key);
      if (!active() || !text.isConnected) return;
      if (result === null) {
        button.hidden = false;
        button.textContent = say('Reintentar traducción','Retry translation');
        button.onclick = () => {
          cache.delete(key);
          button.hidden = true;
          translate();
        };
        return;
      }
      if (result === message.body) return;

      function display() {
        const original = originals.has(message.id);
        text.textContent = original ? message.body : result;
        button.textContent = original ? say('Ver traducción','Show translation') : say('Ver original','Show original');
      }
      button.onclick = () => {
        if (originals.has(message.id)) originals.delete(message.id);
        else originals.add(message.id);
        display();
      };
      button.hidden = false;
      display();
    }

    if (observer) {
      nodes.set(text, translate);
      observer.observe(text);
    } else {
      translate();
    }
  }

  return {
    decorate,
    beforeRender() {
      observer?.disconnect();
    },
    reset() {
      observer?.disconnect();
      translations = new Map();
      originals.clear();
      for (const task of queue.splice(0)) task.resolve(null);
    }
  };
}
