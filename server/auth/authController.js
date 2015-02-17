/*jshint node:true */
'use strict';

var authController = {};

authController.getUser = function (req, res) {
  var userId = null;
  var login = null;
  var url = null;
  var githubAvatar = '';
  console.log('req.user');
  console.log(req.user);
  if (req.user && req.user.get('id') && typeof req.user.get('id') === 'number') {
    userId = req.user.id;
    login = req.user.login;
    url = req.user.url || url;
    githubAvatar = req.user.avatar;
  }
  res.json({
    userId: userId,
    login: login,
    url: url,
    githubAvatar: new Buffer(githubAvatar, 'base64').toString('ascii')
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