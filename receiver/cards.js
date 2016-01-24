'use strict';

/** Places the cards on the board */
function placeCards( gameStateObject ) {
  var rows = document.getElementsByClassName('gameboard')[0].children;
  for(var i=0; i < rows.length; i++) {
    var slots = rows[i].children;
    for(var j=0; j < slots.length; j++) {
      var cards = slots[j].children;
      for(var k=0; k < cards.length; k++) {
        cards[k].appendChild( createCard( gameStateObject.deck.pickCard() ) );
      }
    }
  }
}

function createCard( cardObject ) {
  var value = cardObject.value; // card.value
  var suit = cardObject.suit; // card.suit

  // This stuff builds the card element
  var color = (suit == '&hearts;' || suit == '&diams') ? 'cardRed' : 'cardBlack';

  var cardDiv = document.createElement('div')
  cardDiv.setAttribute('class', 'outline rounded ' + color);
  cardDiv.innerHTML = '<div class="top"><span>'+value+'</span><span>'+suit+'</span></div><h1>'+suit+'</h1><div class="bottom"><span>'+suit+'</span><span>'+value+'</span></div>';

  return cardDiv;
}

function getValue(value) {
  switch(value) {
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    case 14:
      return 'A';
    default:
      return value;
  }
}

// ----------------------------------------------------------------------------------------

var Deck  = function() {
  this.cards = [];

  // Instantiate a deck
  this.setCards = function() {
    var suits = ['&spades', '&hearts', '&diams', '&clubs'];
    var values = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ];

    var i = 0;

    suits.forEach(function(suit) {
      values.forEach(function(value){
        var card = new Card( suit, value );
        this.cards[ i++ ] = card;
      }, this)
    }, this)
  }

  // Chooses a card from the deck randomly and keeps track
  this.pickCard = function() {
    var max = this.cards.length;
    var min = 0;
    var index = Math.floor(Math.random() * (max - min) + min);

    var card = this.cards[ index ];

    this.cards.splice(index, 1);
    return card;
  }

  this.setCards();
}

var Card = function( suit, value ) {
    this.suit = suit;
    this.value = value;
}
