'use strict';
/**
 * Configuration Structure
 *
 * default.js
 * - test.js
 * - development.js
 * - - staging.js
 * - - - production.js
 */
var config = {
  'rethinkdb': {
    'host': 'localhost',
    'port': 28015,
    'db': 'split_or_steal'
  },
  'ports': {
    'http': 8000
  },
  'url': '127.0.0.1',
  'github': {
    'clientID': '641ea714613830ab2ebc',
    'clientSecret': 'a21db46d1297ea70f493308cdcef98bd627a499c',
  },
  'timeFormat': 'YYYY-MM-DDTHH:MM:SSZ',
};
module.exports = config;