import React, { Component } from 'react';
import { connect } from 'react-redux';
import { beginConnection, endConnection, startLoading, stopLoading } from '../actions/client';
import { createGame } from '../factories/game';
import Status from './status';
import Visibility from './visibility';

const LOAD_DELAY = 750;

function mapStateToProps(state) {
  return {
    isConnected: state.client.get('isConnected'),
    isLoading: state.client.get('isLoading')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    onConnect() {
      dispatch(beginConnection());
    },
    onDisconnect() {
      dispatch(endConnection());
    },
    onStartLoading() {
      dispatch(startLoading());
    },
    onStopLoading() {
      dispatch(stopLoading());
    }
  };
}

export class Game extends Component {
  constructor() {
    super();

    this.handleConnect = this.handleConnect.bind(this);
    this.handleReady = this.handleReady.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  componentDidMount() {
    this.props.onStartLoading();

    this.props.socket.on('connect', this.handleConnect);
    this.props.socket.on('ready', this.handleReady);
    this.props.socket.on('disconnect', this.handleDisconnect);
  }

  handleConnect() {
    console.log('CONNECTED');
  }

  handleReady(clientId, gameData, gameState, playerProps) {
    this.props.onConnect();

    console.log('READY (client_id: %s)', clientId, gameData, gameState, playerProps);

    setTimeout(() => {
      createGame(this.props.store, this.props.socket, gameData, gameState, playerProps);

      this.props.onStopLoading();
    }, LOAD_DELAY);
  }

  handleDisconnect() {
    console.log('DISCONNECTED');

    this.props.onStartLoading();
    this.props.onDisconnect();

    document.location.reload();
  }

  render() {
    const { isConnected, isLoading } = this.props;

    return (
      <div className="game">
        {isLoading ? <Status isConnected={isConnected}/> : null}
        <Visibility className="game-container" isVisible={isConnected && !isLoading}>
          <div id="phaser"></div>
          <div className="game-instructions">
            HOW TO PLAY:
            <ul>
              <li>Use ARROW keys to move, SHIFT to sprint and SPACE to attack</li>
              <li>Tag flags for your team by running over them while killing enemy players</li>
              <li>You receive points based on how many flags are tagged for your team</li>
            </ul>
          </div>
        </Visibility>
      </div>
    );
  }
}

export const GameContainer = connect(mapStateToProps, mapDispatchToProps)(Game);
