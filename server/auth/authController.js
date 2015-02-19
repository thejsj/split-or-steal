/*jshint node:true */
'use strict';

var authController = {};

authController.getUser = function (req, res) {
  var userId = null, login = null, url = null, avatarUrl = null;
  if (req.user && req.user.id) {
    userId = req.user.id;
    login = req.user.login;
    url = req.user.url || url;
    avatarUrl = req.user.avatarUrl;
  }
  res.json({
    userId: userId,
    login: login,
    url: url,
    avatarUrl: avatarUrl
  });
};

authController.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

authController.login = function (req, res) {
  res.redirect('/#/home');
};

module.exports = authController;