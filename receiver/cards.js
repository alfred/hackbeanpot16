'use strict';

/** Places the cards on the board */
function placeCards ( gameStateObject ) {
  var slots = document.getElementsByClassName('cardSlot')
  for(var i=0; i < slots.length; i++) {
    slots[i].innerHTML = "";
    slots[i].appendChild( createCard( gameStateObject.deck.pickCard() ) );
  }
}

function createCard( cardObject ) {
  var value = cardObject.value; // card.value
  var suit = cardObject.suit; // card.suit

  // This stuff builds the card element
  var color = (suit == '&hearts;' || suit == '&diams;') ? 'cardRed' : 'cardBlack';

  var cardDiv = document.createElement('div')
  cardDiv.setAttribute('class', 'outline rounded ' + color);
  cardDiv.setAttribute('data-card-value', cardObject.value);
  cardDiv.setAttribute('data-card-suit', cardObject.suit);
  cardDiv.innerHTML = '<div class="top"><span>'+getValue(value)+'</span><span>'+suit+'</span></div><h1>'+suit+'</h1><div class="bottom"><span>'+suit+'</span><span>'+getValue(value)+'</span></div>';

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
    var suits = ['&spades;', '&hearts;', '&diams;', '&clubs;'];
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
