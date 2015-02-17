/*jshint node:true */
'use strict';

var q = require('q');
var r = require('rethinkdb');
var config = require('config');

r.connect(config.get('rethinkdb'))
.then(function (conn) {
  r.conn = conn;
  r.conn.use('split_or_steal');
  // Create Tables
  r.tableList().run(r.conn)
    .then(function (tableList) {
      return q()
        .then(function() {
          if (tableList.indexOf('games') === -1) {
            return r.tableCreate('games').run(r.conn);
          }
        })
        .then(function() {
          if (tableList.indexOf('rounds') === -1) {
            return r.tableCreate('rounds').run(r.conn);
          }
        })
        .then(function () {
          if (tableList.indexOf('users') === -1) {
            return r.tableCreate('users').run(r.conn);
          }
        })
        .then(function () {
          return r.table('users').indexList().run(r.conn)
            .then(function (indexList) {
              if (indexList.indexOf('githubId') === -1) {
                return r.table('users').indexCreate('githubId').run(r.conn);
              }
            });
        });
    });
});

module.exports = r;