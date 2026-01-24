export default function component(options) {
  const Boss = options.pgBoss;
  let boss;

  return {
    async start({ config, logger }) {
      const log = logger?.child?.({ component: "boss" }) || console;
      boss = new Boss(config);
      boss.on('error', log.error);
      await boss.start();
      return boss;
    },
    async stop() {
      return boss.stop();
    }
  }
}
