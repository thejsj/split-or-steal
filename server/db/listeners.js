/*jshint node:true */
'use strict';
var r = require('./index');
var _ = require('lodash');

var onPlayerLosing = function (currentGameId, callback) {
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
    .run(r.conn)
    .then(function (cursor) {
      // NOTE: Why does this fire at the beginning?
      console.log('onPlayerLosing');
      cursor.each(console.log);
    });
};

var onPlayerWinning = function (currentGameId, callback) {
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
    .run(r.conn)
    .then(function (cursor) {
      console.log('onPlayerWinning');
      cursor.each(console.log);
    });
};

var onAllPlayerBetsIn = function (currentGameId, currentRoundId, numberOfPlayers, callback) {
 return r
    .table('rounds')
    .filter({ id: currentRoundId })('bets')
    .changes()
    .run(r.conn)
    .then(function (cursor) {
      cursor.each(function (err, result) {
        // NOTE: Why can't I use size in the database size and be done with it!
        if (_.size(result.new_val) === numberOfPlayers) {
          console.log('onAllPlayerBetsIn');
          callback();
        }
      });
    });
};

var onAllFinalistsIn = function (currentGameId, currentRoundId, callback) {
  console.log('onAllFinalistsIn currentRoundId: ', currentRoundId);
  return r
    .table('rounds')
    .filter({ id: currentRoundId })('finalists')
    .changes()
    .run(r.conn)
    .then(function (cursor) {
      console.log('onAllFinalistsIn');
      cursor.each(function (err, result) {
        // NOTE: Could I get rid of this by using .toArray on the object
        if(_.filter(_.pairs(result.new_val), function (entry) {
          return entry[1] !== null;
        }).length >= 2) {
          callback();
        }
      });
    });
};

exports.onPlayerLosing = onPlayerLosing;
exports.onPlayerWinning = onPlayerWinning;
exports.onAllPlayerBetsIn = onAllPlayerBetsIn;
exports.onAllFinalistsIn = onAllFinalistsIn;