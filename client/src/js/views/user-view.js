/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var _ = require('lodash');
var UserSingleView = require('./user-single-view');

var UserView = React.createClass({
  render: function() {
    var allUsersHaveBet = _.some(this.props.users, function (user) {
      return user.finalist !== undefined;
    });
    return (
      <div className='user-collection-container'>
        { _.map(this.props.users, function(user, i) {
          return <UserSingleView
            key={ user.id }
            user={ user }
            thisUser={ this.props.thisUser }
            allUsersHaveBet={ allUsersHaveBet }
            socket={ this.props.socket }
            roundId={ this.props.roundId }
          />;
        }, this) }
      </div>
    );
  }
});

module.exports = UserView;