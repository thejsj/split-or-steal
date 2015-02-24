/*jshint node:true */
'use strict';
var r = require('./index');
var _ = require('lodash');
var q = require('q');

var createGame = function (connectedUsers) {
  return r
    .table('games')
    .insert({
      'winner': null,
      'players': _.map(_.pluck(connectedUsers, 'userId'), function (user) {
        return {
          id: user,
          score: 1000,
          playerLost: false
        };
      }),
      'numberOfPlayers': _.size(connectedUsers)
    })
    .run(r.conn)
    .then(function (data) {
      return data;
    });
};

var createRound = function (gameId) {
  return r.table('rounds')
    .insert({
      'gameId': gameId,
      'finalists': {},
      'bets': {}
    })
    .run(r.conn)
    .then(function (data) {
      return data;
    });
};

var placeBet = function (roundId, userId, betAmount) {
  var bet = {};
  bet[userId] = betAmount;
  return r.table('rounds')
    .get(roundId)
    .update({
      'bets': bet
    })
    .run(r.conn)
    .then(function (data) {
      return data;
    });
};

var getConnctedUsers = function (currentGameId, currentRoundId) {
  if (!currentGameId) return q();
  return r.table('games')
    .get(currentGameId)('players')
    .eqJoin('id', r.table('users'))
    .without('id')
    .zip()
    .run(r.conn)
    .then(function (data) {
      if (currentRoundId === undefined) return data;
      // NOTE: Is there a more elegant way of doing this in ReQL?
      return r.table('rounds')
        .get(currentRoundId)
        .run(r.conn)
        .then(function (round) {
          // NOTE: Is there a way to do this in ReQL?
          data.forEach(function (user) {
            if (round.bets[user.id] !== undefined) user.bet = round.bets[user.id];
            if (round.finalists[user.id] !== undefined) user.finalist = round.finalists[user.id];
          });
          return data;
        });
    });
};

var setFinalists = function (currentGameId, currentRoundId) {
  var getMax = function (data) {
    var arr = _.sortBy(_.pairs(data), '1');
    return arr[ Math.floor(arr.length / 2) ];
  };
  return r.table('rounds')
    .get(currentRoundId)('bets')
    .run(r.conn)
    .then(function (data) {
      var max1 = getMax(data);
      delete data[max1[0]];
      var max2 = getMax(data);
      delete data[max2[0]];
      // Set Finalists
      var finalists = {};
      finalists[max1[0]] = null;
      finalists[max2[0]] = null;
      // Update Table
      return r.table('rounds')
        .get(currentRoundId)
        .update({
          'finalists': r.literal(finalists)
        })
        .run(r.conn)
        .then(function (data) {
          return data;
        });
    });
};

var setRoundPot = function (currentGameId, currentRoundId) {
  return r.table('rounds')
    .get(currentRoundId)('bets')
    .run(r.conn)
    .then(function (allBets) {
      // NOTE: Why can't I just reduce this on the database side?
      var totalPot = _.reduce(allBets, function (memo, val) {
        return (+memo) + (+val);
      }, 0);
      return r
        .table('rounds')
        .get(currentRoundId)
        .update({ 'pot': totalPot })
        .run(r.conn);
    })
   .then(function (data) {
      return data;
    });
};

var removeBetsFromTotalScore = function (currentGameId, currentRoundId) {
  return r.table('rounds')
    .get(currentRoundId)('bets')
    .run(r.conn)
    .then(function (roundBets) {
      _.each(roundBets, function (value, key) {
        roundBets[key] = -(+value);
      });
      return updateBetsFromTotalScore(currentGameId, currentRoundId, roundBets);
    })
    .then(function (data) {
      return data;
    });
};

/**
 * @param `currentGameId<Number>`
 * @param `currentRoundId<Number>`
 * @param `bets<Object>{<String>:<Number>}`
 * @return Promise
 */
var updateBetsFromTotalScore = function (currentGameId, currentRoundId, bets) {
  return r.table('games')
    .get(currentGameId)('players')
    .run(r.conn)
    .then(function (gamePlayers) {
      gamePlayers.forEach(function (player) {
        if (bets[player.id] !== undefined) {
          player.score += bets[player.id];
        }
      });
      return gamePlayers;
    })
    .then(function (newPlayerScores) {
      return r.table('games')
        .get(currentGameId)
        .update({ 'players': r.literal(newPlayerScores) })
        .run(r.conn);
    })
    .then(function (data) {
      return data;
    });
};

var submitFinalistReponse = function(currentRoundId, userId, finalistReponse) {
  var finalistResponse = {};
  finalistResponse[userId] = finalistReponse;
  return r.table('rounds')
    .get(currentRoundId)
    .update({ 'finalists': finalistResponse })
    .run(r.conn)
    .then(function (data) {
      return data;
    });
};

var splitPotAmongstFinalists = function (currentGameId, currentRoundId) {
  // See if the post will be split,
  return r
    .table('rounds')
    .get(currentRoundId)
    .run(r.conn)
    .then(function (round) {
      var newBets = {};
      var pot = round.pot;
      var finalistResponses = _.pairs(round.finalists);
      var bets = round.bets;
      if (finalistResponses[0][1] === 'steal' && finalistResponses[1][1] === 'steal') {
        console.log('No Winner: Both Steal');
        // Give Everyone Their Money Back
        console.log(bets);
        delete bets[finalistResponses[0][0]];
        delete bets[finalistResponses[1][0]];
        console.log(bets);
        return updateBetsFromTotalScore(currentGameId, currentRoundId, bets);
      } else if (finalistResponses[0][1] === 'split' && finalistResponses[1][1] === 'split') {
        console.log('Split');
        // Split Pot in 2
        newBets[finalistResponses[0][0]] = pot / 2;
        newBets[finalistResponses[1][0]] = pot / 2;
        return updateBetsFromTotalScore(currentGameId, currentRoundId, newBets);
      } else {
        // Give the whole pot to the winner
        var index;
        if (finalistResponses[0][1] === 'steal') {
          index = finalistResponses[0][0];
        }
        if (finalistResponses[1][1] === 'steal') {
          index = finalistResponses[1][0];
        }
        newBets[index] = pot;
        console.log('One Winner', newBets);
        return updateBetsFromTotalScore(currentGameId, currentRoundId, newBets);
      }
    })
    .then(function (data) {
      return data;
    });
};

var updateUsers = function (gameData) {
  if (gameData.currentGameId === undefined) return;
  if (gameData.currentRoundId === undefined) return;
  return getConnctedUsers(gameData.currentGameId, gameData.currentRoundId)
    .then(function (users) {
      gameData.io.emit('userUpdate', users);
    });
};

var checkLosingPlayers = function (gameData) {
  console.log('checkLosingPlayers');
  return r
    .table('games')
    .get(gameData.currentGameId)('players')
    // .filter(r.row('score').le(0))('id')
    .run(r.conn)
    .then(function (cursor) {
      return cursor.toArray();
    })
    .then(function (players) {
      players.forEach(function (player) {
        if (player.score <= 0) player.playerLost = true;
      });
      return r
        .table('games')
        .get(gameData.currentGameId)
        .update({
          'players': players
        })
        .run(r.conn);
    });
};

var checkWinningPlayers = function (gameData) {
  return r
    .table('games')
    .get(gameData.currentGameId)('players')
    .filter(r.row('score').ge(3000))
    .run(r.conn)
    .then(function (cursor){ return cursor.toArray(); })
    .then(function (players) {
      if (players.length > 0) return declareGameWinner(gameData, players[0]);
      return;
    })
    .then(function () {
      return r
        .table('games')
        .get(gameData.currentGameId)('players')
        .filter(r.row('score').gt(0))
        .run(r.conn)
        .then(function (cursor){ return cursor.toArray(); })
        .then(function (players) {
          if (players.length === 1) return declareGameWinner(gameData, players[0]);
          return;
        });
    });
};

var declareGameWinner = function (gameData, player) {
  return r
    .table('games')
    .get(gameData.currentGameId)
    .update({
      'winner': player.id
    })
    .run(r.conn)
    .then(function () {
      return updateUsers(gameData);
    })
    .then(function () {
      gameData.io.emit('gameWinner', player.id);
    });
};

exports.createGame = createGame;
exports.createRound = createRound;
exports.placeBet = placeBet;
exports.getConnctedUsers = getConnctedUsers;
exports.setFinalists = setFinalists;
exports.setRoundPot = setRoundPot;
exports.removeBetsFromTotalScore = removeBetsFromTotalScore;
exports.submitFinalistReponse = submitFinalistReponse;
exports.splitPotAmongstFinalists = splitPotAmongstFinalists;
exports.updateUsers = updateUsers;
exports.checkLosingPlayers = checkLosingPlayers;
exports.checkWinningPlayers = checkWinningPlayers;
exports.checkWinningPlayers = checkWinningPlayers;