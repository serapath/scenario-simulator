const simulator = require('scenario-simulator')
const { name, scenario } = simulator(chunk => {
  console.log({ message: chunk.toString() })
  // e.g. { message: 'asdf' }
})
console.log({ name, scenario })
// e.g.
// { id: 'app1:46207', scenario: [[app1,5],[app2,3]] }