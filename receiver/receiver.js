var playerPick;
var playerPickValue;
var playerPickSuit;
var secondPick;
var secondPickValue;
var secondPickSuit;

window.onload = function() {
  cast.receiver.logger.setLevelValue( 0 );
  var gameStateObject = setupGame();
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
      case 'HIGHER_OR_LOWER': // higher or lower from row 2
        higherOrLower( messageData[ 1 ] );
        window.messageBus.send( event.senderId, 'HIGH_LOW_SUCCESS' );
      break;
      case 'INSIDE_OR_OUTSIDE': // inside or outside from row 3
        insideOrOutside( messageData[ 1 ] );
        window.messageBus.send( event.senderId, 'INSIDE_OUTSIDE_SUCCESS' );
      break;
      case 'SMOKE_OR_FIRE': // smoke or fire from row 4
        smokeOrFire( messageData[ 1 ] );
        window.messageBus.send( event.senderId, 'FAILURE' );
      break;
      case 'PICK_PLAYER': // pick a player to drink
        pickPlayer( messageData[ 1 ] );
        window.messageBus.send( event.senderId, 'PICK_PLAYER_SUCCESS' );
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

function pickRandom( array ) {
  var max = array.length;
  var min = 0;
  var index = Math.floor(Math.random() * (max - min) + min);

  return array[ index ];
}

function chooseCard( cardNumber ) {
  console.log('chooseCard');
  var firstRow = document.getElementsByClassName('cardContainer')[ 3 ].children;
  var card = firstRow[ cardNumber - 1 ];
  card.style.backgroundColor = "#FBF6E2";
  playerPick = card;

  playerPickCard = playerPick.getElementsByClassName('outline')[0];
  playerPickValue = playerPickCard.getAttribute('data-card-value');
  playerPickSuit = playerPickCard.getAttribute('data-card-suit');
};

// choice is the string "higher" or "lower"
function higherOrLower( choice ) {
  console.log('higherOrLower');
  var secondRow = document.getElementsByClassName('cardContainer')[ 2 ].children;
  secondPick = pickRandom( secondRow );
  secondPick.style.backgroundColor = "#FBF6E2";

  secondCard = secondPick.getElementsByClassName('outline')[0];
  secondPickValue = secondCard.getAttribute('data-card-value');
  secondPickSuit = secondCard.getAttribute('data-card-suit');

  var isHigher = playerPickValue < secondPickValue;
  var isLower = playerPickValue > secondPickValue;

  console.log(isHigher);
  console.log(isLower);

  if ( (choice == 'higher' && isHigher ) ||
       (choice == 'lower' &&  isLower ) ) {
    console.log('true');
  } else {
    console.log('false');
  }
};

// choice is the string "inside" or "outside"
function insideOrOutside( choice ) {
  console.log('insideOrOutside');
  var thirdRow = document.getElementsByClassName('cardContainer')[ 1 ].children;
  var randomCard = pickRandom( thirdRow );
  randomCard.style.backgroundColor = "#FBF6E2";

  var thirdCard = randomCard.getElementsByClassName('outline')[0];
  var thirdPickValue = thirdCard.getAttribute('data-card-value');
  var thirdPickSuit = thirdCard.getAttribute('data-card-suit');

  var isInside = thirdPickValue > Math.min(secondPickValue, playerPickValue) &&
                 thirdPickValue < Math.max(secondPickValue, playerPickValue);

  var isOutside = thirdPickValue < Math.min(secondPick.value, playerPickValue) ||
                  thirdPickValue > Math.max(secondPick.value, playerPickValue);

  console.log(isInside);
  console.log(isOutside);

  if ( (choice == 'inside' &&  isInside ) ||
       (choice == 'outside' &&  isOutside ) ) {
    console.log('true');
  } else {
    console.log('false');
  }
};

// choice is the string "smoke" or "fire"
function smokeOrFire( choice ) {
  console.log('smokeOrFire');
  var fourthRow = document.getElementsByClassName('cardContainer')[ 0 ].children;
  var finalCard = fourthRow[ 0 ];
  finalCard.style.backgroundColor = "#FBF6E2";

  var fourthCard = finalCard.getElementsByClassName('outline')[0];
  var fourthPickValue = fourthCard.getAttribute('data-card-value');
  var fourthPickSuit = fourthCard.getAttribute('data-card-suit');

  var isSmoke = (fourthPickSuit == '&clubs;' || fourthPickSuit == '&spades;');
  var isFire = (fourthPickSuit == '&hearts;' || fourthPickSuit == '&diams;');

  console.log(isSmoke);
  console.log(isFire);

  if((choice == 'smoke' && isSmoke ) ||
     (choice == 'fire'  && isFire )) {
    console.log('true');
  } else {
    console.log('false');
  }
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

function flipFirstRow( cardNum, cardChosen ) {
  flipRow(3, cardNum, cardChosen);
};

function flipSecondRow( cardNum, cardChosen ) {
  flipRow(2, cardNum, cardChosen);
};

function flipThirdRow( cardNum, cardChosen ) {
  flipRow(1, cardNum, cardChosen);
};

function flipFourthRow( cardNum, cardChosen ) {
  flipRow(0, cardNum, cardChosen);
};

function flipRow( rowNum, cardNum, cardChosen ) {
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
    deck: new Deck()
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
