/*jshint node:true */
/*global io:true, console:true, $:true */
'use strict';
var React = require('react');
require('react/addons');
var _ = require('lodash');

var UserSingleView = React.createClass({
  getInitialState: function() {
    return {
      betAmount: 100,
      finalistReponse: 'split',
    };
  },
  updateBet: function (event) {
    var value = event.target.value;
    if (this.props.user.score) {
      value = Math.max(value, 0);
      value = Math.min(this.props.user.score, value);
    }
    this.setState({ betAmount: value });
  },
  updateFinalistResponse: function () {
    console.log('value', event.target.value);
    this.setState({ finalistReponse: event.target.value });
  },
  submitLock: function () {
    window.socket.emit('placeBet', {
      userId: window.user.userId,
      betAmount: this.state.betAmount,
      roundId: window.roundId
    });
  },
  submitFinalistReponse: function () {
    if (this.state.finalistReponse !== null) {
      window.socket.emit('submitFinalistReponse', {
        userId: window.user.userId,
        finalistReponse: this.state.finalistReponse,
        roundId: window.roundId
      });
    }
  },
  render: function() {
    var isUser = (this.props.user.login === window.user.login);
    var cx = React.addons.classSet;
    var classes = cx({
      'locked': (this.props.user.bet !== undefined),
      'col-md-2': true,
      'user': true
    });
    // BetBox
    var betBox = null;
    if (isUser && this.props.user.score) {
      betBox =
        <div className='bet-box '>
          <span className='label'>Bet Amount</span>
          <input type='number' name='bet-amount' onChange={ this.updateBet } value={ this.state.betAmount } />
          <button className='lock btn btn-primary' onClick={ this.submitLock }>Lock Bet</button>
        </div>;
    }
    // Finalist Box
    var finaslitBox = <i className="fa fa-lock"></i>;
    if (this.props.user.finalist === null) {
      if (isUser) {
        if (this.state.finalistReponse) {
          finaslitBox =
            <div className='finalist-box'>
              <select value={ this.state.finalistReponse } className='finalist-response option' onChange={ this.updateFinalistResponse }>
                <option value='split'>Split</option>
                <option value='steal'>Steal</option>
              </select>
              <button className='finalist-response submit btn btn-primary' onClick={ this.submitFinalistReponse }>Submit</button>
            </div>;
        } else {
          finaslitBox = <p className='message'>Your Response Has Been Submitted</p>;
        }
      }
    }
    // Score Box
    var scoreBox = null;
    if (this.props.user.score) {
      scoreBox =
        <div className='score-box'>
          <span className='label'>Score</span>
          <h6 className='score'>{ this.props.user.score }</h6>
        </div>;
    }
    return (
      <div className={ classes }>
        <div className='lock-container'>
          { finaslitBox }
        </div>
        <div className='content'>
          <img src={ this.props.user.avatarUrl } />
          <h6 className='login-name'>{ this.props.user.login }</h6>
          { scoreBox }
          { betBox }
        </div>
      </div>
    );
  }
});

module.exports = UserSingleView;