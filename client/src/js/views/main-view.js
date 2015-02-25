/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var HeaderView = require('./header-view');
var UserView = require('./user-view');
var _ = require('lodash');

var MainView = React.createClass({
  render: function () {
    var userView =
      <div className='not-enough-users'>
        <p>Not Enough Users</p>
      </div>;
    if (_.size(this.props.users) > 0) {
      userView = <UserView
        users={ this.props.users }
        socket={ this.props.socket }
        thisUser={ this.props.thisUser }
        roundId={ this.props.roundId }
      />;
    }
    setTimeout(function (){ jQuery('.dropdown-toggle').dropdown(); }, 100);
    return (
      <div className='container main-view-container'>
        <HeaderView thisUser={ this.props.thisUser }/>
        { userView }
      </div>
    );
  }
});

module.exports = MainView;