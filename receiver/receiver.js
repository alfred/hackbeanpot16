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
        showScreen( 'show-connected', 2500 );
      }, 2500 );
      gameStateObject['numberConnected']++;
      askForAName( event.senderId );
    } else {
      // Cap number of players, fuck big groups
      // capping at 4
      if ( gameStateObject['numberConnected'] === 4) { //gameStateObject['numberOfPlayers'] ) {
        window.messageBus.send( event.senderId, 'MAX_PLAYERS_REACHED' )
      } else {
        askForAName( event.senderId );
        gameStateObject['numberConnected']++;
        //add the player to the game
        var player = {
          'playerId' : event.senderId,
          'name' : '',
          'playerNumber' : gameStateObject['numberConnected']
        };
        gameStateObject.playersList.push(player);
      }
    }
  };

  // handler for 'senderdisconnected' event
  castReceiverManager.onSenderDisconnected = function( event ) {
    console.log('Received Sender Disconnected event: ' + event.data );
    // If everyone disconnects close the window
    // or if host disconnects before the game has started close it. This is because only the host
    //gets start game, so if they disconnect befoer the game is started then its fucked
    gameStateObject['numberConnected']--;
    if ( window.castReceiverManager.getSenders().length == 0  
      || gameStateObject['numberConnected'] == 0
      || (!gameStateObject['gameStarted'] && event.senderId === gameStateObject.hostSenderId)) {
      window.close();
    }
    //if the players are playing the game, we want the ability to
    //drop in/drop out. This means that when someone disconnects, we'll move
    //every other player over one space and redisplay them onscreen
    var disconnectingPlayerIndex = findPlayerIndexBySenderId(event.senderId);
    if (gameStateObject['gameStarted']) {
      for(var oldPlayerNumber = gameStateObject['playerList'][disconnectingPlayerIndex].playerNumber + 1;
       i <= gameStateObject['numberConnected']; i++) {
        //decrement the player number of everyone after the disconnector
        var newPlayerNumber = oldPlayerNumber - 1;
        gameStateObject['playerList'][oldPlayerNumber].playerNumber = newPlayerNumber;
        gameStateObject['playerList'][newPlayerNumber] = gameStateObject['playerList'][oldPlayerNumber];
        displayPlayerName(newPlayerNumber, gameStateObject['playerList'][newPlayerNumber].name)
      }
    }
    //last step is to just delete the last player so there are no dupes
    var droppedPlayerNumber = gameStateObject['numberConnected'] + 1
    gameStateObject['playerList'][droppedPlayerNumber + 1] = {
          'playerId' : '',
          'name' : '',
          'playerNumber' : ''
        };
    displayPlayerName(droppedPlayerNumber, "Connect now to join!", true)
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
        var senderPlayerId = findPlayerIndexBySenderId(event.senderId);
        gameStateObject['playersList'][senderPlayerId].name = messageData[ 1 ];
        displayPlayerName( gameStateObject['playersList'][senderPlayerId].playerNumber, messageData[ 1 ]);

        if ( event.senderId === gameStateObject['hostSenderId'] && !gameStateObject['gameStarted']) {
          sendStartGame( event.senderId );
        } else {
          sendNameAck( event.senderId );
        }
      break;
      /*case 'NUM_PLAYERS':
        gameStateObject['numberOfPlayers'] = parseInt( messageData[ 1 ] );
        // Move to the player list screen
        showScreen('show-connected');
        // unhide all the player icons at the bottom
        for (i = 0; i < gameStateObject['numberOfPlayers']; i++) {
          document.getElementsByClassName("player-name")[i].style.visibility = "visible";
        }
        // Ask for the hosts name
        askForAName( gameStateObject['hostSenderId'] );
      break;*/
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
          window.messageBus.send( event.senderId, 'SMOKE_FIRE_SUCCESS' ); // ??????
        } else {
          sendLoseMessage( event.senderId );
        }
      break;
      case 'PICK_PLAYER': // pick a player to drink
        pickPlayer( messageData[ 1 ], event.senderId );
      break;
      case 'START_GAME': // Host starts the game
        window.messageBus.send( event.senderId, 'GAME_HAS_STARTED' );
        showScreen('gameboard');
        gameStateObject['gameStarted'] = true
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

function pickPlayer( playerToDrinkArrayIndex, senderId ) {
  if (playerToDrinkArrayIndex + 1 > gameStateObject['numberOfPlayers']) {
    window.messageBus.send(senderId, 'INVALID_PLAYER_CHOICE');
  }
  var playerIdChosen = gameStateObject['playersList'][ playerToDrinkArrayIndex - 1 ];
  var playerObjectChosen = gameStateObject[ playerIdChosen ];
  var nameDisplayElement = document.getElementsByClassName('success-player-name')[ 0 ];
  nameDisplayElement.innerHTML = playerObjectChosen.name.toUpperCase() + ' DRINKS!';
  showScreen('success');
  window.messageBus.send( senderId, 'PICK_PLAYER_SUCCESS' );
  setTimeout( function() {
    changeTurn();
  }, 2500 );
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
    gameStarted: false,
    deck: new Deck(),
    playersList: [],
    turn: 0
  };
}

function displayPlayerName( playerNumber, playerName, hide ) {
  if (typeof(hide)==='undefined') hide = false;
  var playerNameElements = document.getElementsByClassName('player-name');
  // -1 cause player numbers are 1-4 and arrays are indexed by 0
  var playerNameElement = playerNameElements[ playerNumber - 1 ];
  playerNameElement.style.visibility = 'visible';
  playerNameElement.children[0].innerHTML = playerName;
    //throwing this case in here to make this method double as a way to hide players.
  if (hide) {
    playerNameElement.children[1].src = "../assets/ProfileImgGrey.png";
    return;
  }
  if (playerNumber == 1) {
    playerNameElement.children[1].src = "../assets/ProfileImgBlue.png";
  }
  if (playerNumber == 2) {
    playerNameElement.children[1].src = "../assets/ProfileImgGreen.png";
  }
  if (playerNumber == 3) {
    playerNameElement.children[1].src = "../assets/ProfileImgRed.png";
  }
  if (playerNumber == 4) {
    playerNameElement.children[1].src = "../assets/ProfileImgOrange.png";
  }
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

function findPlayerIndexBySenderId(senderId) {
  for (i = 0; i < gameStateObject['numberConnected']; i++) {
    if (senderId === gameStateObject['playersList'][i].playerId) {
      return i;
    }
  }
}