/*jshint node:true */
'use strict';
var r = require('./index');
var _ = require('lodash');

var createGame = function (connectedUsers) {
  return r
    .table('games')
    .insert({
      'winner': null,
      'players': _.map(_.pluck(connectedUsers, 'userId'), function (user) {
        return {
          id: user,
          score: 1000
        };
      }),
      'numberOfPlayers': _.size(connectedUsers)
    })
    .run(r.conn);
};

var createRound = function (gameId) {
  return r.table('rounds')
    .insert({
      'gameId': gameId,
      'winner': null,
      'finalists': [null, null],
      'bets': {}
    })
    .run(r.conn);
};

var placeBet = function (roundId, userId, betAmount) {
  console.log(' - - - placeBet - - - - -');
  console.log(roundId, userId, betAmount);
  var bet = {};
  bet[userId] = betAmount;
  return r.table('rounds')
    .get(roundId)
    .update({
      'bets': bet
    })
    .run(r.conn);
};

var getConntedUsers = function (currentGameId, currentRoundId) {
  return r.table('games')
    .get(currentGameId)('players')
    .eqJoin('id', r.table('users'))
    .without('id')
    .zip()
    // Add bets?
    .run(r.conn)
    .then(function (data) {
      if (currentRoundId === undefined) return data;
      // Is there a more elegant way of doing this in ReQL?
      return r.table('rounds')
        .get(currentRoundId)('bets')
        .run(r.conn)
        .then(function (bets) {
          data.forEach(function (user) {
            if (bets[user.id] !== undefined) user.bet = bets[user.id];
          });
          return data;
        });
    });
};

exports.createGame = createGame;
exports.createRound = createRound;
exports.placeBet = placeBet;
exports.getConntedUsers = getConntedUsers;