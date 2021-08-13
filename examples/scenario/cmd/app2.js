const start = require('_start')
const simulate = require('../../..')
const { pid, list } = simulate(chunk => console.log('hello'))
start(list.indexOf(pid))
