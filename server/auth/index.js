/*jshint node:true */
'use strict';

var config = require('config');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var q = require('q');
var r = require('../db');

passport.serializeUser(function (user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  r
    .table('users')
    .get(id)
    .run(r.conn)
    .then(function (user) {
      done(null, user);
    });
});

passport.use(new GitHubStrategy({
    clientID: config.get('github').clientID,
    clientSecret: config.get('github').clientSecret,
    callbackURL: 'http://' + config.get('url') + ':' + config.get('ports').http + '/auth/login/callback'
  },
  function (accessToken, refreshToken, profile, done) {
    // I'm not exactly sure when we use an accessToken and a refreshToken
    if (accessToken !== null) {
      r
        .table('users')
        .getAll(profile.username, { index: 'login' })
        .run(r.conn)
        .then(function (cursor) {
          return cursor.toArray()
            .then(function (users) {
              if (users.length > 0) {
                return done(null, users[0]);
              }
              console.log('Creating User');
              return r.table('users')
                .insert({
                  'login': profile.username,
                  'name': profile.displayName,
                  'url': profile.profileUrl,
                  'avatar': r.binary(r.http(profile._json.avatar_url))
                })
                .run(r.conn)
                .then(function (response) {
                  return r.table('users')
                    .get(response.generated_keys[0])
                    .run(r.conn);
                })
                .then(function (newUser) {
                  done(null, newUser);
                });
            });
        })
        .catch(function (err) {
          console.log('Error Getting User', err);
        });
    }
  }
));

passport.checkIfLoggedIn = function (req, res, next) {
  if (req.user) {
    return next();
  }
  return res.status(401).send('You\'re not logged in');
};

module.exports = passport;