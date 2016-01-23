window.onload = function() {
  cast.receiver.logger.setLevelValue( 0 );
  var gameStateObject = setupGame();
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log('Starting Receiver Manager');

  // handler for the 'ready' event
  castReceiverManager.onReady = function( event ) {
    console.log('Received Ready event: ' + JSON.stringify( event.data ) );
    window.castReceiverManager.setApplicationState("Application status is ready...");
  };

  // handler for 'senderconnected' event
  castReceiverManager.onSenderConnected = function(event) {
    console.log('Received Sender Connected event: ' + event.data );
    console.log( window.castReceiverManager.getSender( event.data ).userAgent );

    // window.messageBus.send( event.senderId, 'From Chromecast:' + event.data )
    if ( gameStateObject.hostSenderId === '' ) {
      gameStateObject.hostSenderId = event.senderId;
      showScreen( 'splash' );
      setTimeout( function() {
        showScreen( 'choose-players', 2500 );
        // Increment numberConnected
        gameStateObject['numberConnected']++;
        askForNumberOfPlayers( gameStateObject.hostSenderId );
      }, 2500 );
    } else {
      // Cap number of players, fuck big groups
      if ( gameStateObject['numberConnected'] === gameStateObject['numberOfPlayers'] ) {
        window.messageBus.send( event.senderId, 'MAX_PLAYERS_REACHED' )
      } else {
        askForAName( event.senderId );
        // Increment numberConnected
        gameStateObject['numberConnected']++;
      }
    }
  };

  // handler for 'senderdisconnected' event
  castReceiverManager.onSenderDisconnected = function( event ) {
    console.log('Received Sender Disconnected event: ' + event.data );
    // If everyone disconnects close the window
    if ( window.castReceiverManager.getSenders().length == 0 ) {
      window.close();
    }
  };

  // handler for 'systemvolumechanged' event
  castReceiverManager.onSystemVolumeChanged = function( event ) {
    console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
      event.data['muted'] );
  };

  var messageNameSpace = 'GamePackCast';
  // create a CastMessageBus to handle messages for a custom namespace
  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:' + messageNameSpace );

  // handler for the CastMessageBus message event
  window.messageBus.onMessage = function( event ) {
    console.log('Message [' + event.senderId + ']: ' + event.data );
    var messageData = event.data.split(':');

    switch ( messageData[ 0 ] ) {
      case 'NAME_ENTERED':
        gameStateObject[ event.senderId ] = {
          'name' : messageData[ 1 ],
          'playerNumber' : gameStateObject['numberConnected']
        };
        displayPlayerName( gameStateObject['numberConnected'], messageData[ 1 ]);

        if ( event.senderId === gameStateObject['hostSenderId'] ) {
          sendStartGame( event.senderId );
        } else {
          sendNameAck( event.senderId );
        }
      break;
      case 'NUM_PLAYERS':
        gameStateObject['numberOfPlayers'] = parseInt( messageData[ 1 ] );
        // Move to the player list screen
        showScreen('show-connected');
        // Ask for the hosts name
        askForAName( gameStateObject['hostSenderId'] );
        showScreen('show-connected');
      break;
      case 'PICK_CARD': // pick a card from row 1
        pickCard( messageData[ 1 ] );
      break;
      case 'HIGHER_OR_LOWER': // higher or lower from row 2
        higherOrLower( messageData[ 1 ] );
      break;
      case 'INSIDE_OR_OUTSIDE': // inside or outside from row 3
        insideOrOutside( messageData[ 1 ] );
      break;
      case 'SMOKE_OR_FIRE': // smoke or fire from row 4
        smokeOrFire( messageData[ 1 ] );
      break;
      case 'PICK_PLAYER': // pick a player to drink
        pickPlayer( messageData[ 1 ] );
      break;
      case 'START_GAME': // Host starts the game
        // drawGameboard
        window.messageBus.send( event.senderId, 'GAME_HAS_STARTED' );
        showScreen('gameboard');
      break;
    }
  }

  // initialize the CastReceiverManager with an application status message
  window.castReceiverManager.start( { statusText : "Application is starting" } );
  console.log('Receiver Manager started');
};

function pickCard( pick ) {
  console.log( pick );

};

function higherOrLower( pick) {

};

function insideOrOutside( pick ) {

};

function smokeOrFire( pick ) {

};

function pickPlayer( pick ) {

};

// utility function to display the text message in the input field
function displayText( text ) {
  console.log( text );
  document.getElementsByTagName('p')[ 0 ].innerHTML = text;
  window.castReceiverManager.setApplicationState( text );
};

function showScreen( screenClassName ) {
  var allRows = document.getElementsByClassName('row');
  var arr = [].slice.call( allRows );
  arr.forEach( function( row ) {
    row.style.display = 'none';
  });

  document.getElementsByClassName( screenClassName )[ 0 ].style.display = 'block';
}

function askForAName( senderId ) {
  window.messageBus.send( senderId, 'ENTER_NAME' );
}

function askForNumberOfPlayers( senderId ) {
  window.messageBus.send( senderId, 'ENTER_NUM_PLAYERS' );
}

function setupGame() {
  return {
    hostSenderId: '',
    numberOfPlayers: '',
    numberConnected: ''
  };
}

function displayPlayerName( playerNumber, playerName ) {
  var playerNameElements = document.getElementsByClassName('player-name');
  // -1 cause player numbers are 1-4 and arrays are indexed by 0
  var playerNameElement = playerNameElements[ playerNumber - 1 ];
  playerNameElement.style.visibility = 'visible';
  playerNameElement.innerHTML = '<p>' + playerName  + '</p>';
}

function sendStartGame( senderId ) {
  window.messageBus.send( senderId, 'ACTIVATE_START_BUTTON' );
}

function sendNameAck( senderId ) {
  window.messageBus.send( senderId, 'NAME_RECEIVED' );
}