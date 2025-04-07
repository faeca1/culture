# @faeca1/system

A (very) minimal dependency injection library.

This is heavily inspired by [systemic](https://github.com/guidesmiths/systemic), with changes for enhanced minimalism.

## tl;dr

### Define the system

```js
// system.js
import System from '@faeca1/system';
import config from './components/config.js';
import logger from './components/logger.js';
import postgres from './components/postgres.js';

export default function () {
  return System({
    config: { init: config() },
    logger: { init: logger(), dependsOn: 'config' },
    postgres: {
      primary:   { init: postgres(), dependsOn: ['config', 'logger'] },
      secondary: { init: postgres(), dependsOn: ['config', 'logger']}
    }
  });
};
```

### Run the system

```js
import System from './system';

const events = { SIGTERM: 0, SIGINT: 0, unhandledRejection: 1, error: 1 };

async function main() {
  const system = System();
  const { config, postgres, logger } = await system.start();

  console.log('System has started. Press CTRL+C to stop');

  Object.keys(events).forEach((name) => {
    process.on(name, async () => {
      await system.stop();
      console.log('System has stopped');
      process.exit(events[name]);
    });
  });
}

main();
```
