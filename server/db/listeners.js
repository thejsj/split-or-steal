/*jshint node:true */
'use strict';
var r = require('./index');

var onPlayerLosing = function (currentGameId) {
  return r
    .table('games')
    .filter({id: currentGameId})('players')
    .map(function (doc) {
      return doc('score').min();
    })
    .filter(function (val) {
      return val.le(0);
    })
    .changes()
    .run(r.conn);
};

var onPlayerWinning = function (currentGameId) {
  return r
    .table('games')
    .filter({id: currentGameId})('players')
    .map(function (doc) {
      return doc('score').max();
    })
    .filter(function (val) {
      return val.ge(3000);
    })
    .changes()
    .run(r.conn);
};

exports.onPlayerLosing = onPlayerLosing;
exports.onPlayerWinning = onPlayerWinning;