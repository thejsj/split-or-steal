/*jshint node:true */
'use strict';
var _ = require('lodash');
var Promise = require('bluebird');

var createRound = require('./operations').createRound;
var setFinalists = require('./operations').setFinalists;
var setRoundPot = require('./operations').setRoundPot;
var removeBetsFromTotalScore = require('./operations').removeBetsFromTotalScore;
var splitPotAmongstFinalists = require('./operations').splitPotAmongstFinalists;
var createRound = require('./operations').createRound;
var updateUsers = require('./operations').updateUsers;
var checkLosingPlayers = require('./operations').checkLosingPlayers;
var checkWinningPlayers = require('./operations').checkWinningPlayers;

var onAllPlayerBetsIn = require('./listeners').onAllPlayerBetsIn;
var onAllFinalistsIn = require('./listeners').onAllFinalistsIn;

var playThroughRound = function (gameData) {
  return new Promise(function(resolve, reject) {
    // Given the key, create new round
    createRound(gameData.currentGameId)
      .then(function (res) {
        gameData.currentRoundId = res.generated_keys[0];
        console.log('@ New Round', gameData.currentRoundId);
        gameData.io.emit('newRound', gameData.currentRoundId);

        // Listen to All Bets
        onAllPlayerBetsIn(gameData.currentGameId, gameData.currentRoundId, _.size(gameData.connectedUsers))
          .then(function () {
            // Set Finalists
            return setFinalists(gameData.currentGameId, gameData.currentRoundId)
              .then(function () {
                console.log('@ Finalists Set');
                return removeBetsFromTotalScore(gameData.currentGameId, gameData.currentRoundId);
              })
              .then(function () {
                console.log('@ Set Round Pot');
                return setRoundPot(gameData.currentGameId, gameData.currentRoundId);
              })
              .then(updateUsers.bind(null, gameData));
          });

        // Listen to
        onAllFinalistsIn(gameData.currentGameId, gameData.currentRoundId)
          .then(function () {
            // splitPot
            splitPotAmongstFinalists(gameData.currentGameId, gameData.currentRoundId)
              .then(updateUsers.bind(null, gameData))
              .then(checkLosingPlayers.bind(null, gameData))
              .then(checkWinningPlayers.bind(null, gameData))
              .then(function () {
                console.log('@ Winner Set');
                resolve();
              });
          });

        // Users need to know there's a new round
        updateUsers(gameData);
      })
      .catch(reject);
  });
};

var playThroughRounds = function (gameData) {
  return playThroughRound(gameData)
    .then(playThroughRounds.bind(null, gameData));
};

exports.playThroughRound = playThroughRound;
exports.playThroughRounds = playThroughRounds;