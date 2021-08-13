#!/usr/bin/env node

const COLOR = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fgBlack: '\x1b[30m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
}

const colors = [
  '',
  'fgBlack',
  'fgRed',
  'fgGreen',
  'fgYellow',
  'fgBlue',
  'fgMagenta',
  'fgCyan',
  'fgWhite',
]

const bgcolors = [
  '',
  'bgBlack',
  'bgRed',
  'bgGreen',
  'bgYellow',
  'bgBlue',
  'bgMagenta',
  'bgCyan',
  'bgWhite',
]
function isok (i, k) {
  // ignore invalid unreadable color combinations
  if (i === k) return
  if (i===3 && k ===7) return
  if (i===7 && k ===3) return
  if (i===6 && k ===5) return
  if (i===5 && k ===6) return
  return true
}
const combos = colors.flatMap((color, i) => bgcolors.map((bgcolor, k) => isok(i, k) && ({ bgcolor, color }))).filter(x => x)
function str2hashint (str) {
  let hash = 0
  const arr = str.split('')
  arr.forEach((v, i) => { hash = str.charCodeAt(i) + ((hash << 5) - hash) })
  return hash
}

if (require.main === module) {
  const log = logger('ROOT')
  log.error = logger('ROOT', 'ERROR')
  execute(log).catch(log.error)
} else module_exports()

function module_exports () {
  const [json] = process.argv.slice(2)
  var config
  try {
    config = JSON.parse(json)
  } catch (e) {
    config = { pid: null, list: [] }
  }
  process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p)
    process.exit(2)
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown')
    process.exit(1)
  })
  .on('warning', error => {
    const stack = error.stack
    console.error(error, `warning ${stack}`)
    // process.exit(3)
  }).stdin.on('data', (...args) => handler(...args))
  var handler = () => {}
  module.exports = listener => (handler = listener, config)
}

async function execute (log) {
  const spawn = require('cross-spawn')
  const path = require('path')

  const prefix = process.env.SIM || './demo'
  const SCENARIOS = path.join(process.cwd(), prefix, 'scenario')
  const CMDS = path.join(process.cwd(), prefix, 'scenario/cmd')
  var [scenario_name, PORT] = process.argv.slice(2)
  if (!scenario_name) return log.error('missing `scenario_name` argument')
  if (scenario_name.includes('.')) return log.error('no "." allowed in scenario_name')

  const filename = `${scenario_name}.json`
  const filepath = path.join(SCENARIOS, filename)
  const scenario = Object.entries(require(filepath))
  const cmds = scenario.flatMap(([cmd, n]) => new Array(n).fill(cmd))

  // @NOTE: risk of more cmds in scenario than free ports
  const MAX_PORT = 65535 - cmds.length
  if (PORT) {
    if (!Number.isInteger(Number(PORT))) return log.error('optional `port` argument must be a number')
    // @NOTE: risk of busy ports between PORT and PORT + cmds.length
    if (Number(PORT) < 0 || Number(PORT) > MAX_PORT) return log.error(`try: 0 < port < ${MAX_PORT}`)
  }
  if (!PORT) {
    // @NOTE: risk of all port < MAX_PORT busy
    do {
      PORT = await get_port()
    } while (PORT > MAX_PORT)
  }

  const list = cmds.map((filename, i) => `${filename.split('.')[0]}:${Number(PORT) + i}`)
  const processes = { }
  for (var i = 0, len = cmds.length; i < len; i++) {
    const filename = cmds[i]
    const cmdpath = path.join(CMDS, filename)
    const pid = list[i]
    const config = JSON.stringify({ pid, list })
    const node = spawn('node', [cmdpath, config], { stdio: 'pipe' })
    processes[pid] = node
    const log = logger(pid)
    log.error = logger(pid, 'ERROR')
    log.close = logger(pid, 'CLOSE')
    log.exit = logger(pid, 'EXIT')
    node.stdout.on('data', chunk => log(chunk.toString()))
    node.stderr.on('data', log.error)
    node.on('close', log.close)
    node.on('exit', log.exit)
  }
  const nodes = Object.keys(processes).reduce((nodes, k, i) => (nodes[i] = k, nodes), {})
  process.stdin.on('data', chunk => {
    // @TODO: make nested `by` and `type` transition on REPL easier
    // @TODO: color terminal output nicer
    // @TODO: on error or crash, allow easy restart/update/rollback of processes
    const [cmd = '', ...data] = chunk.toString().split('\n')[0].split(' ')
    if (cmd[0] !== '/') log('type: `/help`')
    else if (cmd === '/help') print_help()
    else {
      const num = cmd.slice(1)
      if (!nodes[num]) return log(`not a valid <node> number: ${cmd}`)
      const node = processes[nodes[num]]
      node.stdin.write(data.join(' '))
    }
  })
  print_help()
  log('----------------------------------------')
  return
  function print_help () {
    log('COMMANDS:', JSON.stringify({
      '/help': {
        args: '',
        demo: '/help',
        info: '(to see this message)',
      },
      '/<node> <text message>': {
        args: {
          '<node>': list,
          '<text message>': 'string',
        },
        demo: '/0 hello world',
        info: 'send <text message> to <node> with a process name',
      },
    }, 0, 2).slice(1).slice(0, -1))
  }
}

function logger (name, type) {
  const int = str2hashint(name)
  const pos = Math.abs(int % combos.length)
  const { bgcolor, color } = combos[pos] || {}
  const prefix = (COLOR[bgcolor] || '') + (COLOR[color] || '')
  const postfix = prefix ? COLOR.reset : ''
  if (type === 'EXIT') return code => {
    console.log(prefix, `[${name}]`, `${type}: ${postfix}\n`, `node process exited with code ${code}`)
  }
  if (type === 'CLOSE') return code => {
    console.log(prefix, `[${name}]`, `${type}: ${postfix}\n`, `node process close all stdio with code ${code}`)
  }
  if (type === 'ERROR') return (...args) => {
    console.error(prefix, `[${name}]`, `${type}: ${postfix}\n`, ...args.map(arg => arg.toString()))
  }
  return (...args) => console.log() || console.log(prefix, `[${name}] ${postfix}\n`, ...args.map(arg => arg.toString()))
}
function get_port () {
  const net = require('net')
  var server = net.createServer(sock => sock.end('end'))
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port
      server.close(() => {
        server.unref()
        resolve(port)
      })
    })
  })
}
