function logError (e) {
  console.log(e)
}

function blue (str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`
}

function green (str) {
  return `\x1b[1m\x1b[32m${str}\x1b[39m\x1b[22m`
}

function red (str) {
  return `\x1b[1m\x1b[31m${str}\x1b[39m\x1b[22m`
}

function yellow (str) {
  return `\x1b[1m\x1b[33m${str}\x1b[39m\x1b[22m`
}

module.exports = {
  blue,
  green,
  red,
  yellow,
  logError
}
