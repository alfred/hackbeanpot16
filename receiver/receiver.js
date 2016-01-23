window.onload = function() {
  cast.receiver.logger.setLevelValue( 0 );
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
    window.messageBus.send( event.senderId, 'From Chromecast:' + event.data );
    showScreen( 'splash' );
    setTimeout( showScreen( 'choose-players' , 2500);
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
    // display the message from the sender
    displayText( event.data );
    // inform all senders on the CastMessageBus of the incoming message event
    // sender message listener will be invoked
    window.messageBus.send( event.senderId, 'From Chromecast:' + event.data );
  }

  // initialize the CastReceiverManager with an application status message
  window.castReceiverManager.start( { statusText : "Application is starting" } );
  console.log('Receiver Manager started');
};

// utility function to display the text message in the input field
function displayText( text ) {
  console.log( text );
  document.getElementsByTagName('p')[ 0 ].innerHTML = text;
  window.castReceiverManager.setApplicationState( text );
};

function showScreen( screenClassName ) {
  document.getElementsByClassName('row').forEach( function( row ) {
    row.style.display = 'none';
  });

  document.getElementsByClassName( screenClassName )[ 0 ].style.display = 'block';
}
