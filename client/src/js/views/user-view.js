/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
var _ = require('lodash');
var UserSingleView = require('./user-single-view');

var UserView = React.createClass({
  render: function() {
    if (!this.props.thisUser) return (null);
    if (_.size(this.props.users) <= 0) {
      return (
        <div className='not-enough-users'>
          <div className='row'>
            <div className='col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1 not-enough-users-notice'>
              <p>Not Enough Users. At least 2 players are needed to start a new game.</p>
            </div>
          </div>
        </div>
      );
    }
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