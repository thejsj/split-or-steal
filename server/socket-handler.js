/*jshint node:true */
'use strict';
var _ = require('lodash');

var onPlayerLosing = require('./db/listeners').onPlayerLosing;
var onPlayerWinning = require('./db/listeners').onPlayerWinning;
var onAllPlayerBetsIn = require('./db/listeners').onAllPlayerBetsIn;
var onAllFinalistsIn = require('./db/listeners').onAllFinalistsIn;

var createGame = require('./db/operations').createGame;
var createRound = require('./db/operations').createRound;
var placeBet = require('./db/operations').placeBet;
var getConnctedUsers = require('./db/operations').getConnctedUsers;
var setFinalists = require('./db/operations').setFinalists;
var setRoundPot = require('./db/operations').setRoundPot;
var removeBetsFromTotalScore = require('./db/operations').removeBetsFromTotalScore;
var submitFinalistReponse = require('./db/operations').submitFinalistReponse;
var splitPotAmongstFinalists = require('./db/operations').splitPotAmongstFinalists;

var connectedUsers = {}, currentGameId = false, currentRoundId = null;

var socketHandler = function (io, socket) {

  var updateUsers = function () {
    console.log('+ updateUsers');
    getConnctedUsers(currentGameId, currentRoundId)
      .then(function (users) {
        console.log('- updateUsers');
        io.emit('userUpdate', users);
      });
  };

  socket.on('connctedUser', function (user) {
    if (connectedUsers[user.userId] === undefined) {
      connectedUsers[user.userId] = user;
      connectedUsers[user.userId].socketId = socket.id;
      io.emit('userUpdate', connectedUsers);
      if (_.size(connectedUsers) >= 2 && !currentGameId) {
        // Create new game in the database (what will be the structure)
        createGame(connectedUsers)
          .then(function (res) {
            currentGameId = res.generated_keys[0];
            console.log('New Game Created!', currentGameId);

            // Create listener for loser (0)
            onPlayerLosing(currentGameId, function () {
              console.log(' - A Player Has Lost');
            });

            // Create listener for winner (3000)
            onPlayerWinning(currentGameId, function () {
              console.log('- A Player Has Won');
            });

            // Given the key, create new round
            createRound(currentGameId)
              .then(function (res) {
                currentRoundId = res.generated_keys[0];
                console.log('New Round', currentRoundId);
                io.emit('newRound', currentRoundId);

                // Listen to All Bets
                onAllPlayerBetsIn(currentGameId, currentRoundId, _.size(connectedUsers), function () {
                  // Set Finalists
                  return setFinalists(currentGameId, currentRoundId)
                    .then(function () {
                      console.log('Finalists Set');
                      return removeBetsFromTotalScore(currentGameId, currentRoundId);
                    })
                    .then(function () {
                      console.log('Set Round Pot');
                      return setRoundPot(currentGameId, currentRoundId);
                    })
                    .then(updateUsers);
                });

                // Listen to
                onAllFinalistsIn(currentGameId, currentRoundId, function () {
                  // splitPot
                  splitPotAmongstFinalists(currentGameId, currentRoundId)
                    .then(function () {
                      console.log('Winner Set');
                    });
                });
              });
          });
      }
    }
  });

  socket.on('placeBet', function (data) {
    console.log('placeBet', data.roundId, data);
    placeBet(data.roundId, data.userId, data.betAmount)
      .then(function () {
        updateUsers();
      });
  });

  socket.on('submitFinalistReponse', function (data) {
    console.log('submitFinalistReponse', data);
    submitFinalistReponse(data.roundId, data.userId, data.finalistReponse)
      .then(updateUsers);
  });

  socket.on('disconnect', function() {
    _.each(connectedUsers, function (user, key) {
      if (user.socketId === socket.id) delete connectedUsers[key];
    });
    updateUsers();
   });
};

module.exports = socketHandler;