/*jshint node:true */
'use strict';
var r = require('./index');
var _ = require('lodash');
var Promise = require('bluebird');

var onAllPlayerBetsIn = function (currentGameId, currentRoundId, numberOfPlayers) {
  return new Promise(function (resolve, reject) {
    r.getNewConnection()
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
                resolve();
              }
            });
        });
      })
      .catch(reject);
  });
};

var onAllFinalistsIn = function (currentGameId, currentRoundId) {
  // console.log('onAllFinalistsIn currentRoundId: ', currentRoundId);
  return new Promise(function (resolve, reject) {
    r.getNewConnection()
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
                resolve();
              }
            });
          });
      })
      .catch(reject);
  });
};

exports.onAllPlayerBetsIn = onAllPlayerBetsIn;
exports.onAllFinalistsIn = onAllFinalistsIn;