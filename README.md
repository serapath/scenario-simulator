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
```js
// project/app/<appname1>.js
const simulator = require('scenario-simulator')
const { name, scenario } = simulator(chunk => {
  console.log({ message: chunk.toString() })
})
console.log({ name, scenario })
// e.g. `{ name: <appname1:9001>, scenario: [[appfile1,5],[appname2,3]] }
```
```js
// project/scenario/<scenarioname>.json
{
  ['<appname1>.js']: 5, // amount of instances
  ['<appname2>.js']: 3, // amount of instances
  // ...
}
```
```bash
npm start <scenarioname>
```