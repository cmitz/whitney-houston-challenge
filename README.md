# The Whitney Houston Challenge

This project is a tiny browser game. It will be run on localhost, never on a server. The game will use local storage to save high scores.

## The game

You will play the Whitney Houston challenge. In her famous song "I will always love you", you will need to press the spacebar at exactly the right time the drum beats before the iconic chorus. The difference between the time you press the spacebar and the time the drum beats will be displayed on the screen, and will be saved.

### Flow

When the game starts, the user first needs to enter their team name. After that, the game will start. We will play a snippet of the song (starting at 2:55 and 3:10 (with a fade out)). The game will record the amount of milliseconds between the actual drum and the spacebar press, and that will be your score. The score will be void when you're too late. You only get one attempt.

The score will be added to a high score list, displayed on the right. When you are within 100 milliseconds of the drum beat, the game will show confetti.

#### Detailed game plan

The game guides you through the audio sample. It will display text in the screen like so:
1. Ready to go?
2. Get ready now...
3. Listen carefully!
4. Now it's up to you!

When the player hits the button "before" the mark, it will say either-or:
1. Nailed it! within 20ms of the mark!
1. You did it! You're only 50ms off!
1. Almost! You were 150ms off

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
