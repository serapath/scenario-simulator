const simulator = require('scenario-simulator')
const { name, scenario } = simulator(chunk => {
  console.log({ message: chunk.toString() })
})
console.log({ name, scenario })
// e.g. `{ name: <appname1:9001>, scenario: [[appfile1,5],[appname2,3]] }