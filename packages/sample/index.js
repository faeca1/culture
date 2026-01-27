const _ = require("@faeca1/matter").default;
const { system } = require("./lib/system");

_.system
  .runner(system())
  .start()
  .then(sys => sys.logger.info("sample system started"));
