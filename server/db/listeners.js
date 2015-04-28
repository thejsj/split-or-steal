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
          .get(currentRoundId)
          .changes()
          .map(r.row('new_val')('bets').keys().count().ge(numberOfPlayers))
          .run(conn)
          .then(function (cursor) {
            cursor.each(function (err, result) {
              console.log('onAllPlayerBetsIn', result, numberOfPlayers);
              if (result) resolve();
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
          .get(currentRoundId)
          .changes()
          .map(r.row('new_val')('finalists').coerceTo('array'))
          .map(
            r.expr(true)
            .and(
              r.row
               .count().gt(0)
            )
            .and(
              r.row
               .count(function (row) { return row(1).eq(null) })
               .eq(0)
            )
          )
          .run(conn)
          .then(function (cursor) {
            cursor.each(function (err, result) {
              console.log('onAllFinalistsIn', result);
              if (result) resolve();
            });
          });
      })
      .catch(reject);
  });
};

exports.onAllPlayerBetsIn = onAllPlayerBetsIn;
exports.onAllFinalistsIn = onAllFinalistsIn;
