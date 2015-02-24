/*jshint node:true */
'use strict';
var r = require('./index');
var _ = require('lodash');

var onAllPlayerBetsIn = function (currentGameId, currentRoundId, numberOfPlayers, callback) {
  return r
    .getNewConnection()
    .then(function (conn) {
      return r
        .table('rounds')
        .filter({ id: currentRoundId })('bets')
        // (0)
        // .keys().count().ge(2)
        .changes()
        .run(conn)
        .then(function (cursor) {
          cursor.each(function (err, result) {
            // NOTE: Why can't I use size in the database size and be done with it!
            if (_.size(result.new_val) === numberOfPlayers) {
              // console.log('onAllPlayerBetsIn');
              callback();
            }
          });
      });
    });
};

var onAllFinalistsIn = function (currentGameId, currentRoundId, callback) {
  // console.log('onAllFinalistsIn currentRoundId: ', currentRoundId);
   return r
    .getNewConnection()
    .then(function (conn) {
      return r
        .table('rounds')
        .filter({ id: currentRoundId })('finalists')
        // (0)
        // .coerceTo('array')
        // .map(r.row(1))
        // .count(function (row) { return row.eq(null); }).eq(0)
        .changes()
        .run(conn)
        .then(function (cursor) {
          cursor.each(function (err, result) {
            // NOTE: Could I get rid of this by using .toArray on the object
            if(_.filter(_.pairs(result.new_val), function (entry) {
              return entry[1] !== null;
            }).length >= 2) {
              callback();
            }
          });
        });
    });
};

exports.onAllPlayerBetsIn = onAllPlayerBetsIn;
exports.onAllFinalistsIn = onAllFinalistsIn;