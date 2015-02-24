/*jshint node:true */
'use strict';

var express = require('express');
var authControllers = require('./authController');

var auth = require('./index');
var authRouter = express.Router();

authRouter.use('/login/callback', auth.authenticate('github'), function (req, res) {
  res.redirect('/');
});
authRouter.get('/login', auth.authenticate('github'));
authRouter.use('/user', authControllers.getUser);
authRouter.use('/logout', authControllers.logout);

module.exports = authRouter;