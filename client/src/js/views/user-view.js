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
    console.log('allUsersHaveBet', allUsersHaveBet);
    return (
      <div className='user-collection-container'>
        { _.map(this.props.users, function(user, i) {
          return <UserSingleView key={ user.id } user={ user } allUsersHaveBet={ allUsersHaveBet } />;
        }, this) }
      </div>
    );
  }
});

module.exports = UserView;