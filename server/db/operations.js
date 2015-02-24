/*jshint node:true */
'use strict';
var r = require('./index');
var _ = require('lodash');
var q = require('q');

var createGame = function (connectedUsers) {
  console.time('createGame');
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
    .run(r.conn)
    .then(function (data) {
      console.timeEnd('createGame');
      return data;
    });
};

var createRound = function (gameId) {
  console.time('createRound');
  return r.table('rounds')
    .insert({
      'gameId': gameId,
      'winner': null,
      'finalists': {},
      'bets': {}
    })
    .run(r.conn)
    .then(function (data) {
      console.timeEnd('createRound');
      return data;
    });
};

var placeBet = function (roundId, userId, betAmount) {
  console.time('placeBet');
  var bet = {};
  bet[userId] = betAmount;
  return r.table('rounds')
    .get(roundId)
    .update({
      'bets': bet
    })
    .run(r.conn)
    .then(function (data) {
      console.timeEnd('placeBet');
      return data;
    });

};

var getConnctedUsers = function (currentGameId, currentRoundId) {
  if (!currentGameId) return q();
  console.time('getConnctedUsers');
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
          console.timeEnd('getConnctedUsers');
          return data;
        });
    });
};

var setFinalists = function (currentGameId, currentRoundId) {
  console.time('setFinalists');
  var getMax = function (data) {
    return _.max(_.pairs(data), function (entry) {
      return entry[1];
    });
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
          console.timeEnd('setFinalists');
          return data;
        });
    });
};

var setRoundPot = function (currentGameId, currentRoundId) {
  console.time('setRoundPot');
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
      console.timeEnd('setRoundPot');
      return data;
    });
};

var removeBetsFromTotalScore = function (currentGameId, currentRoundId) {
  console.timeEnd('removeBetsFromTotalScore');
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
      console.timeEnd('removeBetsFromTotalScore');
      return data;
    });
};

// var updateBetsFromTotalScore = function (currentGameId, currentRoundId) {
//   console.log('updateBetsFromTotalScore');
//   return r.table('rounds')
//     .get(currentRoundId)('bets')
//     .run(r.conn)
//     .then(function (roundBets) {
//       return updateBetsFromTotalScore(currentGameId, currentRoundId, roundBets);
//     })
//     .then(function (data) {
//       console.log('updateBetsFromTotalScore');
//       return data;
//     });
// };

/**
 * @param `currentGameId<Number>`
 * @param `currentRoundId<Number>`
 * @param `bets<Object>{<String>:<Number>}`
 * @return Promise
 */
var updateBetsFromTotalScore = function (currentGameId, currentRoundId, bets) {
  console.time('updateBetsFromTotalScore');
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
      console.timeEnd('updateBetsFromTotalScore');
      return data;
    });
};

var submitFinalistReponse = function(currentRoundId, userId, finalistReponse) {
  console.time('submitFinalistReponse');
  var finalistResponse = {};
  finalistResponse[userId] = finalistReponse;
  console.log('submitFinalistReponse');
  console.log(finalistResponse);
  return r.table('rounds')
    .get(currentRoundId)
    .update({ 'finalists': finalistResponse })
    .run(r.conn)
    .then(function (data) {
      console.timeEnd('submitFinalistReponse');
      return data;
    });
};

var splitPotAmongstFinalists = function (currentGameId, currentRoundId) {
  console.time('splitPotAmongstFinalists');
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
      console.log('pot', pot);
      console.log('bets', bets);
      console.log('finalistResponses', finalistResponses);
      if (finalistResponses[0][1] === 'steal' && finalistResponses[1][1] === 'steal') {
        console.log('No Winner: Both Steal');
        // Give Everyone Their Money Back
        _.each(bets, function (value, key) {
          if (key === finalistResponses[0][1] || key === finalistResponses[1][1]) {
            delete bets[key];
          }
        });
        return updateBetsFromTotalScore(currentGameId, currentRoundId, bets);
      } else if (finalistResponses[0][1] === 'split' && finalistResponses[1][1] === 'split') {
        console.log('Split');
        // Split Pot in 2
        newBets[finalistResponses[0][0]] = pot / 2;
        newBets[finalistResponses[1][0]] = pot / 2;
        return updateBetsFromTotalScore(currentGameId, currentRoundId, newBets);
      } else {
        console.log('One Winner');
        // Give the whole pot to the winner
        var index;
        if (finalistResponses[0][1] === 'steal') {
          index = finalistResponses[0][0];
        }
        if (finalistResponses[0][1] === 'steal') {
          index = finalistResponses[1][0];
        }
        newBets[index] = pot;
        return updateBetsFromTotalScore(currentGameId, currentRoundId, newBets);
      }
    })
    .then(function (data) {
      console.timeEnd('splitPotAmongstFinalists');
      return data;
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