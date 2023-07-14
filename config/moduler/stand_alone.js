const wakeup = name => {
  const lists = require(`${REQUIRE_PATH.moduler}/modules.json`).modules
  for (let i in lists) {
    if (i != name) continue;
    module.exports[i] = require(`${REQUIRE_PATH.hanger}${lists[i]}`)
    console.log(`require & moduler exported::${i}`)
    break;
  }
  return module.exports[name]
}
module.exports = {wakeup}