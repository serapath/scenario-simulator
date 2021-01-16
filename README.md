# scenario-simulator
start multiple `<appfile>.js` processes based on a `<scenario>.json` file

# use
`npm install scenario-simulator`

```js
// project/package.json
{
  "private": true,
  "name": "example",
  "version": "0.0.0",
  "description": "scenario-simulator demo",
  "dependencies": {
    "scenario-simulator": "^0.0.0"
  },
  "scripts": {
    "start": "simulate"
  }
}

```

**ussage** `simulate <scenario-name> [<port>]`
```bash
npm start
# [ROOT] ERROR:
#  missing `scenario_name` argument
npm start foo
# [ROOT] ERROR:
#  Error: Cannot find module '<project>/scenario/foo.json'
# Require stack:
# - <project>/node_modules/scenario-simulator/src/scenario-simulator.js
# ...
npm start 1
# [ROOT] COMMANDS:
#   "/help": {
#     "args": "",
#     "demo": "/help",
#     "info": "(to see this message)"
#   },
#   "/<node> <text message>": {
#     "args": {
#       "<node>": {
#         "0": "app:46207"
#       },
#       "<text message>": "string"
#     },
#     "demo": "/0 hello world",
#     "info": "send <text message> to <node> with a process name"
#   }
# [ROOT] ----------------------------------------
# [app:46207] { id: 'app:46207', scenario: [ [ 'app.js', 1 ] ] }
<ctrl-c>
npm start 1 foo
# [ROOT] ERROR:
#  optional `port` argument must be a number
npm start 1 999111
# [ROOT] ERROR:
#  try: 0 < port < 65534
npm start 9000
# [ROOT] COMMANDS:
#   "/help": {
#     "args": "",
#     "demo": "/help",
#     "info": "(to see this message)"
#   },
#   "/<node> <text message>": {
#     "args": {
#       "<node>": {
#         "0": "app:9000"
#       },
#       "<text message>": "string"
#     },
#     "demo": "/0 hello world",
#     "info": "send <text message> to <node> with a process name"
#   }
# [ROOT] ----------------------------------------
# [app:9000] { id: 'app:9000', scenario: [ [ 'app.js', 1 ] ] }
asdf
# [ROOT] type: `/help`
/help
# [ROOT] COMMANDS:
#   "/help": {
#     "args": "",
#     "demo": "/help",
#     "info": "(to see this message)"
#   },
#   "/<node> <text message>": {
#     "args": {
#       "<node>": {
#         "0": "app:9000"
#       },
#       "<text message>": "string"
#     },
#     "demo": "/0 hello world",
#     "info": "send <text message> to <node> with a process name"
#   }
/1 asdf
# [ROOT] not a valid process number: /1
/0 asdf
# [app:9000] { message: 'asdf' }
<ctrl-c>
```

with

```js
// <project>/app/app1.js
const simulator = require('scenario-simulator')
const { name, scenario } = simulator(chunk => {
  console.log({ message: chunk.toString() })
  // e.g. { message: 'asdf' }
})
console.log({ name, scenario })
// e.g.
// { id: 'app1:46207', scenario: [[app1,5],[app2,3]] }
```

```js
// <project>/scenario/1.json
{
  "app1.js": 5, // amount of instances of `app1.js`
  "app2.js": 3, // amount of instances of `app2.js`
  // ...
}
```