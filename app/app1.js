const simulate = require('scenario-simulator')
const { pid, nodes } = simulate(chunk => {
  console.log({ message: chunk.toString() })
  // e.g. { message: 'asdf' }
})
console.log({ pid, nodes })
// e.g.
// { pid: 'app1:34955', nodes: ['app1:36659','app1:36660','app1:36661','app1:36662','app1:36663','app2:36664','app2:36665','app2:36666'] }