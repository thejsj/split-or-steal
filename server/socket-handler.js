/*jshint node:true */
'use strict';
var _ = require('lodash');

var onPlayerLosing = require('./db/listeners').onPlayerLosing;
var onPlayerWinning = require('./db/listeners').onPlayerWinning;
var createGame = require('./db/operations').createGame;
var createRound = require('./db/operations').createRound;
var placeBet = require('./db/operations').placeBet;
var getConntedUsers = require('./db/operations').getConntedUsers;

var connectedUsers = {}, currentGameId = false, currentRoundId = null;



var socketHandler = function (io, socket) {

  var updateUsers = function () {
    getConntedUsers(currentGameId, currentRoundId)
      .then(function (users) {
        io.emit('userUpdate', users);
      });
  };

  socket.on('connectUser', function (user) {
    if (connectedUsers[user.userId] === undefined) {
      connectedUsers[user.userId] = user;
      connectedUsers[user.userId].socketId = socket.id;
      io.emit('userUpdate', connectedUsers);
      if (_.size(connectedUsers) >= 2 && !currentGameId) {
        // Create new game in the database (what will be the structure)
        console.log('Create New Game');
        createGame(connectedUsers)
          .then(function (res) {
            currentGameId = res.generated_keys[0];
            console.log('New Game Created!', currentGameId);
            // Create listener for loser (0)
            onPlayerLosing(currentGameId)
              .then(function () {
                console.log('A PLAYER HAS LOST');
              });
            // Create listener for winner (3000)
            onPlayerWinning(currentGameId)
              .then(function () {
                console.log('A Player Has Won!!!');
              });
            // Given the key, create new round
            createRound(currentGameId)
              .then(function (res) {
                currentRoundId = res.generated_keys[0];
                console.log('newRound', currentRoundId);
                io.emit('newRound', currentRoundId);
              });
          });
      }
    }
  });

  socket.on('placeBet', function (data) {
    console.log('placeBet', currentRoundId, data);
    placeBet(currentRoundId, data.userId, data.betAmount)
      .then(function () {
        updateUsers();
      });
  });

  socket.on('disconnect', function() {
    _.each(connectedUsers, function (user, key) {
      if (user.socketId === socket.id) delete connectedUsers[key];
    });
    updateUsers();
   });
};

module.exports = socketHandler;