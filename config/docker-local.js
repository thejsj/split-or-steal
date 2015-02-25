/*jshint node:true */
'use strict';
/**
 * Inherits from `default.js`
 */
var config = {
  'rethinkdb': {
    'host': process.env.RETHINKDB_PORT_8080_TCP_ADDR,
    'port': process.env.RETHINKDB_PORT_28015_TCP_PORT
  },
  'ports' : {
    'http' : process.env.PORT
  },
  'url': 'docker.dev',
  'github': {
    'clientID': '3f8d23dbe9ab3e69c6cc',
    'clientSecret': 'd706a2aa65d025a6e28bd5a4a19b97ad83c3e915',
  }
};

module.exports = config;