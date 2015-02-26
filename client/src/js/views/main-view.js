/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var HeaderView = require('./header-view');
var UserView = require('./user-view');
var LoginView = require('./login-view');
var _ = require('lodash');

var MainView = React.createClass({
  render: function () {
    setTimeout(function (){ jQuery('.dropdown-toggle').dropdown(); }, 100);
    return (
      <div className='container main-view-container'>
        <HeaderView thisUser={ this.props.thisUser }/>
        <LoginView thisUser={ this.props.thisUser }/>
        <UserView
          users={ this.props.users }
          socket={ this.props.socket }
          thisUser={ this.props.thisUser }
          roundId={ this.props.roundId }
        />
      </div>
    );
  }
});

module.exports = MainView;