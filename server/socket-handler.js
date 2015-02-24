/*jshint node:true */
'use strict';
var _ = require('lodash');

var onPlayerLosing = require('./db/listeners').onPlayerLosing;
var onPlayerWinning = require('./db/listeners').onPlayerWinning;

var createGame = require('./db/operations').createGame;
var placeBet = require('./db/operations').placeBet;
var submitFinalistReponse = require('./db/operations').submitFinalistReponse;
var updateUsers = require('./db/operations').updateUsers;
var playThroughRounds = require('./db/playThroughRound').playThroughRounds;

var gameData = {
  connectedUsers: {},
  currentGameId: false,
  currentRoundId: null
};


var socketHandler = function (io, socket) {

  // Set IO
  gameData.io = gameData.io || io;

  socket.on('connctedUser', function (user) {
    if (gameData.connectedUsers[user.userId] === undefined) {
      console.log('BEFORE length:', _.size(gameData.connectedUsers), _.pluck(gameData.connectedUsers, 'login'));
      gameData.connectedUsers[user.userId] = user;
      gameData.connectedUsers[user.userId].socketId = socket.id;
      gameData.io.emit('userUpdate', gameData.connectedUsers);
      console.log('length:', _.size(gameData.connectedUsers), _.pluck(gameData.connectedUsers, 'login'));
      if (_.size(gameData.connectedUsers) >= 2 && !gameData.currentGameId) {
        console.log('Create Game');
        // Create new game in the database (what will be the structure)
        createGame(gameData.connectedUsers)
          .then(function (res) {
            gameData.currentGameId = res.generated_keys[0];
            console.log('@ New Game Created!', gameData.currentGameId);

            // Create listener for loser (0)
            onPlayerLosing(gameData.currentGameId, function () {
              console.log('@ A Player Has Lost');
            });

            // Create listener for winner (3000)
            onPlayerWinning(gameData.currentGameId, function () {
              console.log('@ A Player Has Won');
            });

            playThroughRounds(gameData);
          });
      }
    }
  });

  socket.on('placeBet', function (data) {
    placeBet(data.roundId, data.userId, data.betAmount)
      .then(function () {
        updateUsers(gameData);
      });
  });

  socket.on('submitFinalistReponse', function (data) {
    submitFinalistReponse(data.roundId, data.userId, data.finalistReponse)
      .then(updateUsers.bind(null, gameData));
  });

  socket.on('disconnect', function() {
    _.each(gameData.connectedUsers, function (user, key) {
      if (user.socketId === socket.id) delete gameData.connectedUsers[key];
    });
    updateUsers(gameData);
   });
};

module.exports = socketHandler;