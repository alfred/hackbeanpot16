var playerPick;
var playerPickValue;
var playerPickSuit;
var secondPick;
var secondPickValue;
var secondPickSuit;
var randomIndexChosen;
var gameStateObject;

window.onload = function() {
  cast.receiver.logger.setLevelValue( 0 );
  gameStateObject = setupGame();
  console.log(gameStateObject);
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
        gameStateObject.playersList.push(event.senderId);

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
      break;
      case 'PICK_CARD': // pick a card from row 1
        chooseCard( messageData[ 1 ] );
        window.messageBus.send( event.senderId, 'PICK_CARD_SUCCESS' );
      break;
      case 'HIGHER_OR_LOWER': // higher or lower from row
        if (higherOrLower( messageData[ 1 ] )) {
          window.messageBus.send( event.senderId, 'HIGH_LOW_SUCCESS' ); // ??????
        } else {
          sendLoseMessage( event.senderId );
        }
      break;
      case 'INSIDE_OR_OUTSIDE': // inside or outside from row 3
        if ( insideOrOutside( messageData[ 1 ] ) ) {
          window.messageBus.send( event.senderId, 'INSIDE_OUTSIDE_SUCCESS' ); // ??????
        } else {
          sendLoseMessage( event.senderId );
        }
      break;
      case 'SMOKE_OR_FIRE': // smoke or fire from row 4
        if ( smokeOrFire( messageData[ 1 ] ) ) {
          window.messageBus.send( event.senderId, 'SMOKE_OR_FIRE_SUCCESS' ); // ??????

        } else {
          sendLoseMessage( event.senderId );
        }
      break;
      case 'PICK_PLAYER': // pick a player to drink
        pickPlayer( messageData[ 1 ] );
        window.messageBus.send( event.senderId, 'PICK_PLAYER_SUCCESS' );
        changeTurn();
      break;
      case 'START_GAME': // Host starts the game
        window.messageBus.send( event.senderId, 'GAME_HAS_STARTED' );
        showScreen('gameboard');
        placeCards( gameStateObject );
      break;
    }
  }

  // initialize the CastReceiverManager with an application status message
  window.castReceiverManager.start( { statusText : "Application is starting" } );
  console.log('Receiver Manager started');
};

function changeTurn() {
  gameStateObject.turn = (gameStateObject.turn + 1) % gameStateObject.playersList.length;
  flipAllDown();
  showScreen('gameboard');
  placeCards( gameStateObject );
  window.messageBus.send( gameStateObject.playersList[gameStateObject.turn], 'GAME_HAS_STARTED' );
}

function chooseCard( cardNumber ) {
  var firstRow = document.getElementsByClassName('cardContainer')[ 3 ].children;
  var card = firstRow[ cardNumber - 1 ];
  playerPick = card;

  flipFirstRow( cardNumber );

  playerPickCard = playerPick.getElementsByClassName('outline')[0];
  playerPickValue = parseInt(playerPickCard.getAttribute('data-card-value'));
  playerPickSuit = playerPickCard.getAttribute('data-card-suit');
};

// choice is the string "higher" or "lower"
function higherOrLower( choice ) {
  var secondRow = document.getElementsByClassName('cardContainer')[ 2 ].children;

  var randomNum = Math.floor(Math.random() * 3) + 1;
  secondPick = secondRow[randomNum - 1];
  flipSecondRow(randomNum);

  secondCard = secondPick.getElementsByClassName('outline')[0];
  secondPickValue = parseInt(secondCard.getAttribute('data-card-value'));
  secondPickSuit = secondCard.getAttribute('data-card-suit');

  var isHigher = playerPickValue < secondPickValue;
  var isLower = playerPickValue > secondPickValue;

  return (choice == 'HIGHER' && isHigher ) || (choice == 'LOWER' &&  isLower );
};

// choice is the string "inside" or "outside"
function insideOrOutside( choice ) {
  var thirdRow = document.getElementsByClassName('cardContainer')[ 1 ].children;

  var randomNum = Math.floor(Math.random() * 2) + 1
  var randomCard = thirdRow[randomNum - 1];
  flipThirdRow(randomNum);

  var thirdCard = randomCard.getElementsByClassName('outline')[0];
  var thirdPickValue = parseInt(thirdCard.getAttribute('data-card-value'));
  var thirdPickSuit = thirdCard.getAttribute('data-card-suit');

  var isInside = thirdPickValue > Math.min(secondPickValue, playerPickValue) &&
                 thirdPickValue < Math.max(secondPickValue, playerPickValue);

  var isOutside = thirdPickValue < Math.min(secondPickValue, playerPickValue) ||
                  thirdPickValue > Math.max(secondPickValue, playerPickValue);

  return ( (choice == 'INSIDE' &&  isInside ) || (choice == 'OUTSIDE' &&  isOutside ) );
};

// choice is the string "smoke" or "fire"
function smokeOrFire( choice ) {
  var fourthRow = document.getElementsByClassName('cardContainer')[ 0 ].children;
  var finalCard = fourthRow[ 0 ];

  flipFourthRow(1);

  var fourthCard = finalCard.getElementsByClassName('outline')[0];
  var fourthPickValue = parseInt(fourthCard.getAttribute('data-card-value'));
  var fourthPickSuit = fourthCard.getAttribute('data-card-suit');

  var isSmoke = (fourthPickSuit == '&clubs;' || fourthPickSuit == '&spades;');
  var isFire = (fourthPickSuit == '&hearts;' || fourthPickSuit == '&diams;');

  return ( ( choice == 'SMOKE' && isSmoke ) || ( choice == 'FIRE'  && isFire ) );
};

function pickPlayer( choice ) {
  // Sends a message to that player to drink ayyy
};

function flipAllUp() {
  var cards = document.getElementsByClassName('cardWrapper');
  for(var i=0; i<cards.length; i++) {
    cards[i].children[0].style.display = 'block';
    cards[i].children[1].style.display = 'none';
  }
}

function flipAllDown() {
  var cards = document.getElementsByClassName('cardWrapper');
  for(var i=0; i<cards.length; i++) {
    cards[i].children[0].style.display = 'none';
    cards[i].children[1].style.display = 'block';
  }
}

function flipFirstRow( cardNum ) {
  flipRow(3, cardNum );
};

function flipSecondRow( cardNum ) {
  flipRow(2, cardNum );
};

function flipThirdRow( cardNum ) {
  flipRow(1, cardNum );
};

function flipFourthRow( cardNum ) {
  flipRow(0, cardNum );
};

function flipRow( rowNum, cardNum ) {
  var row = document.getElementsByClassName('cardRow')[rowNum];
  var card = row.getElementsByClassName('cardWrapper')[cardNum - 1];
  flipCard(card);
}

function flipCard(card) {
  if (isVisible(card.children[0])) {
    // card is face up so flip it face down
    card.children[0].style.display = 'none';
    card.children[1].style.display = 'block';
  } else {
    // card is face down so flip it face up
    card.children[0].style.display = 'block';
    card.children[1].style.display = 'none';
  }
}

function isVisible(elem) {
  return elem.offsetWidth > 0 || elem.offsetHeight > 0;
}

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
    numberConnected: '',
    deck: new Deck(),
    playersList: [],
    turn: 0
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

function sendLoseMessage( senderId ) {
  window.messageBus.send( senderId, 'FAILURE' );
  setTimeout( function() {
    showScreen('failure');
    setTimeout( function() {
      changeTurn();
    }, 2500 );
  }, 2500 );
}
